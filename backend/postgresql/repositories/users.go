package repositories

import (
	"context"
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
		return "", dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return "", dbError(ErrorQueryExec, err)
	}

	var res struct {
		UID string `db:"id"`
	}
	err = pgxscan.ScanOne(&res, rows)

	var pgErr *pgconn.PgError
	if errors.Is(err, pgx.ErrNoRows) {
		return "", dbError(ErrorNoRows, err)
	} else if ok := errors.As(err, &pgErr); ok && pgErr.Code == "23505" && pgErr.ConstraintName == "users_email_key" {
		return "", dbError(ErrorDuplicateUserEmail, err)
	} else if err != nil {
		return "", dbError(ErrorScanRows, err)
	}

	return res.UID, nil
}
