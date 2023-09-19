package auth

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fb-clone/libs/config"
	"fb-clone/postgresql/repositories"
	"fmt"
	"log"
	"os"
	"time"

	"golang.org/x/crypto/argon2"

	"github.com/golang-jwt/jwt/v5"
)

const AuthCookieName = "auth_v0"

type authService struct {
	signingKey            *rsa.PrivateKey
	credentialsRepository repositories.CredentialsRepository
}

type AuthService interface {
	Signin(ctx context.Context, email, password string) (string, error)
	CreateCredentials(ctx context.Context, email, password, uid string) (string, error)
	ValidateToken(token string) (string, error)
}

func NewAuthService(credentialsRepository repositories.CredentialsRepository) (AuthService, error) {
	privateKeyString, err := os.ReadFile(config.Cfg.Auth.RSAKeyFile)
	if err != nil {
		return nil, fmt.Errorf("Failed to initialize Authentication Service: %w", err)
	}

	block, _ := pem.Decode(privateKeyString)
	signingKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		log.Fatalf("Failed to parse private auth key: %v", err)
	}

	return &authService{
		signingKey,
		credentialsRepository,
	}, nil
}

func (s authService) Signin(ctx context.Context, email, password string) (string, error) {
	creds, err := s.credentialsRepository.GetCredentials(ctx, email)
	if err != nil {
		return "", err
	}

	hash := argon2.IDKey(
		[]byte(password),
		creds.Salt,
		config.Cfg.Auth.Argon2Time,
		config.Cfg.Auth.Argon2Memory,
		config.Cfg.Auth.Argon2Threads,
		config.Cfg.Auth.Argon2KeyLength,
	)
	if !bytes.Equal(creds.Hash, hash) {
		return "", fmt.Errorf("incorrect password")
	}

	claims := jwt.RegisteredClaims{
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 60 * 60 * time.Second)),
		Subject:   creds.UserID,
	}
	rawToken := jwt.NewWithClaims(jwt.SigningMethodRS512, claims)
	token, err := rawToken.SignedString(s.signingKey)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s authService) CreateCredentials(ctx context.Context, email, password, uid string) (string, error) {
	salt := make([]byte, 30)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		config.Cfg.Auth.Argon2Time,
		config.Cfg.Auth.Argon2Memory,
		config.Cfg.Auth.Argon2Threads,
		config.Cfg.Auth.Argon2KeyLength,
	)

	err = s.credentialsRepository.InsertCredentials(ctx, repositories.Credentials{
		Email:  email,
		Hash:   hash,
		Salt:   salt,
		UserID: uid,
	})

	if err != nil {
		return "", err // TODO: revert process of creating an account if error occures
	}

	return s.Signin(ctx, email, password)
}

type CustomError struct {
	ClientError string
}

func (err CustomError) Error() string {
	return string(err.ClientError)
}

func (s authService) ValidateToken(tokenString string) (string, error) {
	fmt.Println(tokenString)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return &s.signingKey.PublicKey, nil
	})

	if err != nil {
		return "", fmt.Errorf("validating token: %w", err)
	}

	if !token.Valid {
		return "", fmt.Errorf("token invalid")
	}

	claims, ok := token.Claims.(jwt.RegisteredClaims)
	if !ok {
		return "", fmt.Errorf("claims is not RegisteredClaims type")
	}

	uid := claims.Subject
	if uid == "" {
		return "", fmt.Errorf("did not find sub claim")
	}

	eat := claims.ExpiresAt
	if eat.Before(time.Now()) {
		return "", fmt.Errorf("token is expired")
	}

	return uid, nil
}
