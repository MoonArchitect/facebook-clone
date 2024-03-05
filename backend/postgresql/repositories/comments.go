package repositories

import (
	"context"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
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
	DeletePostComments(ctx context.Context, postID string) error
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
		return errors.Errorf("failed generate uuid: %w", err)
	}

	sql, args, err := sq.
		Insert(commentsTable).
		Columns("id", "post_id", "owner_id", "text").
		Values(uuid.String(), postID, userID, text).
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

func (r commentsRepository) DeletePostComments(ctx context.Context, postID string) error {
	sql, args, err := sq.
		Delete(commentsTable).
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

func (r commentsRepository) GetFromManyPosts(ctx context.Context, postIDs []string) ([]Comment, error) {
	sql, args, err := sq.
		Select("*").
		From(commentsTable).
		Where(squirrel.Eq{"post_id": postIDs}).
		OrderBy("created_at ASC").
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res []Comment
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return res, nil
}
