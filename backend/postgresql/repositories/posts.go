package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Post struct {
	Id         string    `db:"id"`
	OwnerId    string    `db:"owner_id"`
	PostText   string    `db:"post_text"`
	PostImages []string  `db:"post_images"`
	LikeCount  int       `db:"like_count"`
	ShareCount int       `db:"share_count"`
	CreatedAt  time.Time `db:"created_at"`
}

type PostsRepository interface {
	GetPostByID(ctx context.Context, postID string) (Post, error)
	CreatePost(ctx context.Context, userID, text string, imageID *string) error
	DeletePost(ctx context.Context, postID string) error

	IncrementPostLikeCount(ctx context.Context, postID string) error
	DecrementPostLikeCount(ctx context.Context, postID string) error
	IncrementPostShareCount(ctx context.Context, postID string) error

	GetUserPostsByDate(ctx context.Context, userID string, skip, limit uint64) ([]Post, error)
	GetMostPopularPosts(ctx context.Context, skip, limit uint64) ([]Post, error)
}

type postsRepository struct {
	dbPool *pgxpool.Pool
}

func NewPostsRepository(dbPool *pgxpool.Pool) PostsRepository {
	return &postsRepository{
		dbPool,
	}
}

func (r postsRepository) CreatePost(ctx context.Context, userID, text string, imageID *string) error {
	uuid, err := uuid.NewRandom() // TODO: generate uuid in database
	if err != nil {
		return fmt.Errorf("failed generate uuid: %w", err)
	}

	images := []string{}
	if imageID != nil {
		images = append(images, *imageID)
	}

	sql, args, err := sq.
		Insert(postsTable).
		Columns("id", "owner_id", "post_text", "post_images").
		Values(uuid.String(), userID, text, images).
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

func (r postsRepository) DeletePost(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Delete(postsTable).
		Where(squirrel.Eq{"id": postID}).
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

func (r postsRepository) GetUserPostsByDate(ctx context.Context, userID string, skip, limit uint64) ([]Post, error) {
	sql, args, err := sq.
		Select("*").
		From(postsTable).
		Where(squirrel.Eq{"owner_id": userID}).
		OrderBy("created_at DESC").
		Offset(skip).
		Limit(limit).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res []Post
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return res, nil
}

func (r postsRepository) GetMostPopularPosts(ctx context.Context, skip, limit uint64) ([]Post, error) {
	sql, args, err := sq.
		Select("*").
		From(postsTable).
		OrderBy("like_count DESC").
		OrderBy("created_at DESC").
		Offset(skip).
		Limit(limit).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res []Post
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return res, nil
}

func (r postsRepository) GetPostByID(ctx context.Context, postID string) (Post, error) {
	sql, args, err := sq.
		Select("*").
		From(postsTable).
		Where(squirrel.Eq{"id": postID}).
		ToSql()

	if err != nil {
		return Post{}, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return Post{}, dbError(ErrorQueryRows, err)
	}

	var res Post
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return Post{}, dbError(ErrorNoRows, err)
	} else if err != nil {
		return Post{}, dbError(ErrorScanRows, err)
	}

	return res, nil
}

func (r postsRepository) IncrementPostLikeCount(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Update(postsTable).
		Set("like_count", squirrel.Expr("like_count + 1")).
		Where(squirrel.Eq{"id": postID}).
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

func (r postsRepository) DecrementPostLikeCount(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Update(postsTable).
		Set("like_count", squirrel.Expr("GREATEST(like_count - 1, 0)")).
		Where(squirrel.Eq{"id": postID}).
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

func (r postsRepository) IncrementPostShareCount(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Update(postsTable).
		Set("share_count", squirrel.Expr("share_count + 1")).
		Where(squirrel.Eq{"id": postID}).
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
