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

type Comment struct {
	Id         string    `db:"id"`
	PostId     string    `db:"post_id"`
	OwnerId    string    `db:"owner_id"`
	Text       string    `db:"text"`
	ReplyCount int       `db:"reply_count"`
	CreatedAt  time.Time `db:"created_at"`
}

type CommentsRepository interface {
	GetFromManyPosts(ctx context.Context, postIDs []string) ([]Comment, error)
	CreateComment(ctx context.Context, userID, text, postID string) error
}

type commentsRepository struct {
	dbPool *pgxpool.Pool
}

func NewCommentsRepository(dbPool *pgxpool.Pool) CommentsRepository {
	return &commentsRepository{
		dbPool,
	}
}

func (r commentsRepository) CreateComment(ctx context.Context, userID, text, postID string) error {
	uuid, err := uuid.NewRandom() // TODO: generate uuid in database
	if err != nil {
		return fmt.Errorf("failed generate uuid: %w", err)
	}

	sql, args, err := sq.
		Insert(commentsTable).
		Columns("id", "post_id", "owner_id", "text").
		Values(uuid.String(), postID, userID, text).
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

func (r commentsRepository) GetFromManyPosts(ctx context.Context, postIDs []string) ([]Comment, error) {
	sql, args, err := sq.
		Select("*").
		From(commentsTable).
		Where(squirrel.Eq{"post_id": postIDs}).
		OrderBy("created_at ASC").
		ToSql()

	if err != nil {
		return nil, fmt.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to select: %w", err)
	}

	var res []Comment
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, fmt.Errorf("failed to scan rows: %w", err)
	}

	return res, nil
}
