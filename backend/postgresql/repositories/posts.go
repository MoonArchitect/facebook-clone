package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Post struct {
	Id         string    `db:"id"`
	OwnerId    string    `db:"owner_id"`
	PostText   string    `db:"post_text"`
	PostImages []string  `db:"post_images"`
	Comments   []Comment `db:"comments"`
	CreatedAt  time.Time `db:"created_at"`
}

type Comment struct {
	Text string `json:"text"`
}

type PostsRepository interface {
	CreatePost(ctx context.Context, userID, text string) error
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
