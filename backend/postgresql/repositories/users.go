package repositories

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
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
	if errors.Is(err, pgx.ErrNoRows) {
		return "", fmt.Errorf("no creds")
	} else if err != nil {
		return "", fmt.Errorf("failed to scan rows: %w", err)
	}
	// TODO
	// else if pgerr := err.(*pgconn.PgError); pgerr.Code == "23505" {
	// 	return "", fmt.Errorf("duplicate email")
	// }

	return res.UID, nil
}
