package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID        string
	Email     string
	CreatedAt time.Time
}

type UserRepository interface {
	CreateUser(ctx context.Context, email string) (string, error)
}

var (
	EmailAlreadyRegistered = errors.Errorf("email already exists")
)

type userRepository struct {
	dbPool *pgxpool.Pool
}

func NewUserRepository(dbPool *pgxpool.Pool) UserRepository {
	return &userRepository{
		dbPool,
	}
}

func (r userRepository) CreateUser(ctx context.Context, email string) (string, error) {
	sql, args, err := sq.
		Insert(userTable).
		Columns("email").
		Values(email).
		Suffix("RETURNING id").
		ToSql()

	if err != nil {
		return "", fmt.Errorf("failed to create insert creds query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return "", fmt.Errorf("failed to insert user: %w", err)
	}

	var res struct {
		UID string `db:"id"`
	}
	err = pgxscan.ScanOne(&res, rows)

	var pgErr *pgconn.PgError
	if errors.Is(err, pgx.ErrNoRows) {
		return "", fmt.Errorf("no creds")
	} else if ok := errors.As(err, &pgErr); ok && pgErr.Code == "23505" && pgErr.ConstraintName == "users_email_key" {
		return "", errors.New(EmailAlreadyRegistered)
	} else if err != nil {
		return "", fmt.Errorf("failed to scan rows: %w", err)
	}

	return res.UID, nil
}
