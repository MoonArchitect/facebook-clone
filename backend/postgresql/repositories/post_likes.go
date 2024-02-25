package repositories

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostLike struct {
	Id     int64  `db:"id"`
	UserID string `db:"user_id"`
	PostID string `db:"post_id"`
}

type PostLikesRepository interface {
	IsPostLikedByUser(ctx context.Context, userID, postID string) (bool, error)
	LikePost(ctx context.Context, userID, postID string) error
	UnlikePost(ctx context.Context, userID, postID string) error
}

type postLikesRepository struct {
	dbPool *pgxpool.Pool
}

func NewPostLikesRepository(dbPool *pgxpool.Pool) PostLikesRepository {
	return &postLikesRepository{
		dbPool,
	}
}

func (r postLikesRepository) IsPostLikedByUser(ctx context.Context, userID, postID string) (bool, error) {
	sql, args, err := sq.
		Select("*").
		From(postLikesTable).
		Where(squirrel.And{
			squirrel.Eq{"user_id": userID},
			squirrel.Eq{"post_id": postID},
		}).
		ToSql()

	if err != nil {
		return false, fmt.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return false, fmt.Errorf("failed to select: %w", err)
	}

	var res PostLike
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	} else if err != nil {
		return false, fmt.Errorf("failed to scan rows: %w", err)
	}

	return true, nil
}

func (r postLikesRepository) LikePost(ctx context.Context, userID, postID string) error {
	sql, args, err := sq.
		Insert(postLikesTable).
		Columns("user_id", "post_id").
		Values(userID, postID).
		ToSql()

	if err != nil {
		return fmt.Errorf("failed to create select query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to select: %w", err)
	}

	return nil
}

func (r postLikesRepository) UnlikePost(ctx context.Context, userID, postID string) error {
	sql, args, err := sq.
		Delete(postLikesTable).
		Where(squirrel.Eq{"user_id": userID, "post_id": postID}).
		ToSql()

	if err != nil {
		return fmt.Errorf("failed to create select query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to select: %w", err)
	}

	return nil
}
