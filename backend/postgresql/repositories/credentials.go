package repositories

import (
	"context"
	"errors"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TODO: go generate schema
type Credentials struct {
	Id     string `db:"id"`
	Email  string `db:"email"`
	Hash   []byte `db:"hash"`
	Salt   []byte `db:"salt"`
	UserID string `db:"user_id"`
}

type CredentialsRepository interface {
	GetCredentials(ctx context.Context, email string) (*Credentials, error)
	DeleteCredentials(ctx context.Context, email string) error
	InsertCredentials(ctx context.Context, creds Credentials) error
}

type credentialsRepository struct {
	dbPool *pgxpool.Pool
}

func NewCredentialsRepository(dbPool *pgxpool.Pool) CredentialsRepository {
	return &credentialsRepository{
		dbPool,
	}
}

func (cr credentialsRepository) GetCredentials(ctx context.Context, email string) (*Credentials, error) {
	sql, args, err := sq.
		Select("*").
		From(credentialsTable).
		Where(squirrel.Eq{"email": email}).
		ToSql()

	if err != nil {
		return nil, fmt.Errorf("failed to create select creds query: %w", err)
	}

	var creds Credentials
	rows, err := cr.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query: %w", err)
	}

	err = pgxscan.ScanOne(&creds, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("no creds")
	} else if err != nil {
		return nil, fmt.Errorf("failed to scan rows: %w", err)
	}

	return &creds, nil
}

func (cr credentialsRepository) InsertCredentials(ctx context.Context, creds Credentials) error {
	sql, args, err := sq.
		Insert(credentialsTable).
		Columns("email", "hash", "salt", "user_id").
		Values(creds.Email, creds.Hash, creds.Salt, creds.UserID).
		ToSql()

	if err != nil {
		return fmt.Errorf("failed to create insert creds query: %w", err)
	}

	_, err = cr.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to insert creds: %w", err)
	}

	// if res.RowsAffected() != 0 {
	// 	return fmt.Errorf("did not insert creds")
	// }

	return nil
}

func (cr credentialsRepository) DeleteCredentials(ctx context.Context, email string) error {
	sql, args, err := sq.
		Delete(credentialsTable).
		Where(squirrel.Eq{"email": email}).
		ToSql()

	if err != nil {
		return fmt.Errorf("failed to create delete creds query: %w", err)
	}

	res, err := cr.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete creds: %w", err)
	}

	if res.RowsAffected() != 0 {
		return fmt.Errorf("did not delete creds")
	}

	return nil
}
