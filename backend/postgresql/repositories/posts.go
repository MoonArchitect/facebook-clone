package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
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

type Comment struct {
	Id         string    `db:"id"`
	PostId     string    `db:"post_id"`
	OwnerId    string    `db:"owner_id"`
	Text       string    `db:"text"`
	ReplyCount int       `db:"reply_count"`
	CreatedAt  time.Time `db:"created_at"`
}

type PostsRepository interface {
	CreatePost(ctx context.Context, userID, text string) error
	GetUserPostsByDate(ctx context.Context, userID string) ([]Post, error)
	IncrementPostLikeCount(ctx context.Context, postID string) error
	DecrementPostLikeCount(ctx context.Context, postID string) error
	IncrementPostShareCount(ctx context.Context, postID string) error
}

type postsRepository struct {
	dbPool *pgxpool.Pool
}

func NewPostsRepository(dbPool *pgxpool.Pool) PostsRepository {
	return &postsRepository{
		dbPool,
	}
}

func (r postsRepository) CreatePost(ctx context.Context, userID, text string) error {
	uuid, err := uuid.NewRandom() // TODO: generate uuid in database
	if err != nil {
		return fmt.Errorf("failed generate uuid: %w", err)
	}

	sql, args, err := sq.
		Insert(postsTable).
		Columns("id", "owner_id", "post_text").
		Values(uuid.String(), userID, text).
		ToSql()

	if err != nil {
		return fmt.Errorf("failed to create insert post query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to insert post: %w", err)
	}

	return nil
}

func (r postsRepository) GetUserPostsByDate(ctx context.Context, userID string) ([]Post, error) {
	sql, args, err := sq.
		Select("*").
		From(postsTable).
		Where(squirrel.Eq{"owner_id": userID}).
		OrderBy("created_at DESC").
		ToSql()

	if err != nil {
		return nil, fmt.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to select: %w", err)
	}

	var res []Post
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, fmt.Errorf("failed to scan rows: %w", err)
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
		return fmt.Errorf("failed to create update query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update: %w", err)
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
		return fmt.Errorf("failed to create update query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update: %w", err)
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
		return fmt.Errorf("failed to create update query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update: %w", err)
	}

	return nil
}
