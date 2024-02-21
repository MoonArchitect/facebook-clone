package auth_validator

import (
	"crypto/rsa"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type authValidator struct {
	publicKey *rsa.PublicKey
}

type AuthValidator interface {
	ValidateToken(token string) (string, error)
}

func NewAuthValidator(publicKey rsa.PublicKey) AuthValidator {
	return authValidator{
		publicKey: &publicKey,
	}
}

func (s authValidator) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return s.publicKey, nil
	})

	if err != nil {
		return "", fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return "", fmt.Errorf("token invalid")
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
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
