package repositories

import (
	"context"

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
	GetUserLikesForPosts(ctx context.Context, userID string, postIDs []string) ([]PostLike, error)
	DeletePostLikes(ctx context.Context, postID string) error
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
		return false, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return false, dbError(ErrorQueryRows, err)
	}

	var res PostLike
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	} else if err != nil {
		return false, dbError(ErrorScanRows, err)
	}

	return true, nil
}

func (r postLikesRepository) DeletePostLikes(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Delete(postLikesTable).
		Where(squirrel.Eq{"post_id": postID}).
		ToSql()

	if err != nil {
		return dbError(ErrorBuildQuery, err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return dbError(ErrorQueryExec, err)
	}

	return nil
}

func (r postLikesRepository) GetUserLikesForPosts(ctx context.Context, userID string, postIDs []string) ([]PostLike, error) {
	sql, args, err := sq.
		Select("*").
		From(postLikesTable).
		Where(squirrel.And{
			squirrel.Eq{"user_id": userID},
			squirrel.Eq{"post_id": postIDs},
		}).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res []PostLike
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return res, nil
}

func (r postLikesRepository) LikePost(ctx context.Context, userID, postID string) error {
	sql, args, err := sq.
		Insert(postLikesTable).
		Columns("user_id", "post_id").
		Values(userID, postID).
		ToSql()

	if err != nil {
		return dbError(ErrorBuildQuery, err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return dbError(ErrorQueryRows, err)
	}

	return nil
}

func (r postLikesRepository) UnlikePost(ctx context.Context, userID, postID string) error {
	sql, args, err := sq.
		Delete(postLikesTable).
		Where(squirrel.Eq{"user_id": userID, "post_id": postID}).
		ToSql()

	if err != nil {
		return dbError(ErrorBuildQuery, err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return dbError(ErrorQueryRows, err)
	}

	return nil
}
