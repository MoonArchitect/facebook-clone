package repositories

import (
	"context"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FriendshipRequest struct {
	ID        string    `db:"id"`
	UserID    string    `db:"user_id"`
	FriendID  string    `db:"friend_id"`
	CreatedAt time.Time `db:"created_at"`
}

type FriendshipRequestsRepository interface {
	CheckRequestExists(ctx context.Context, requesterID, userID string) (bool, error)
	GetAllUserRequests(ctx context.Context, uid string) ([]FriendshipRequest, error)
	GetAllPendingRequests(ctx context.Context, uid string) ([]FriendshipRequest, error)
	CreateFriendRequest(ctx context.Context, requesterID, userID string) error
	DeleteFriendRequest(ctx context.Context, requesterID, userID string) error
}

type friendshipRequestsRepository struct {
	dbPool *pgxpool.Pool
}

func NewFriendshipRequestsRepository(dbPool *pgxpool.Pool) FriendshipRequestsRepository {
	return &friendshipRequestsRepository{
		dbPool,
	}
}

func (r friendshipRequestsRepository) CheckRequestExists(ctx context.Context, requesterID, userID string) (bool, error) {
	sql, args, err := sq.
		Select("*").
		From(friendshipRequestsTable).
		Where(squirrel.Eq{"user_id": requesterID, "friend_id": userID}).
		ToSql()

	if err != nil {
		return false, errors.Errorf("failed to create create query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return false, errors.Errorf("failed to create: %w", err)
	}

	var res FriendshipRequest
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}

func (r friendshipRequestsRepository) CreateFriendRequest(ctx context.Context, requesterID, userID string) error {
	sql, args, err := sq.
		Insert(friendshipRequestsTable).
		Values(requesterID, userID).
		Columns("user_id", "friend_id").
		ToSql()

	if err != nil {
		return errors.Errorf("failed to create create query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return errors.Errorf("failed to create: %w", err)
	}

	return nil
}

func (r friendshipRequestsRepository) DeleteFriendRequest(ctx context.Context, requesterID, userID string) error {
	sql, args, err := sq.
		Delete(friendshipRequestsTable).
		Where(squirrel.Or{
			squirrel.Eq{"user_id": requesterID, "friend_id": userID},
			squirrel.Eq{"user_id": userID, "friend_id": requesterID},
		}).
		ToSql()

	if err != nil {
		return errors.Errorf("failed to create delete query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return errors.Errorf("failed to exec query: %w", err)
	}

	return nil
}

func (r friendshipRequestsRepository) GetAllUserRequests(ctx context.Context, uid string) ([]FriendshipRequest, error) {
	sql, args, err := sq.
		Select("*").
		From(friendshipRequestsTable).
		Where(squirrel.Eq{"user_id": uid}).
		ToSql()

	if err != nil {
		return nil, errors.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, errors.Errorf("failed to select: %w", err)
	}

	var res []FriendshipRequest
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, errors.Errorf("failed to scan rows: %w", err)
	}

	return res, nil
}

func (r friendshipRequestsRepository) GetAllPendingRequests(ctx context.Context, uid string) ([]FriendshipRequest, error) {
	sql, args, err := sq.
		Select("*").
		From(friendshipRequestsTable).
		Where(squirrel.Eq{"friend_id": uid}).
		ToSql()

	if err != nil {
		return nil, errors.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, errors.Errorf("failed to select: %w", err)
	}

	var res []FriendshipRequest
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, errors.Errorf("failed to scan rows: %w", err)
	}

	return res, nil
}
