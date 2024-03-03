package repositories

import (
	"context"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Friendship struct {
	UserID   string `db:"user_id"`
	FriendID string `db:"friend_id"`
}

type FriendshipRepository interface {
	GetAllFriends(ctx context.Context, uid string) ([]Friendship, error)
	AreFriends(ctx context.Context, uid1, uid2 string) (bool, error)
	AddFriendship(ctx context.Context, requesterID, userID string) error
}

type friendshipRepository struct {
	dbPool *pgxpool.Pool
}

func NewFriendshipRepository(dbPool *pgxpool.Pool) FriendshipRepository {
	return &friendshipRepository{
		dbPool,
	}
}

func (r friendshipRepository) GetAllFriends(ctx context.Context, uid string) ([]Friendship, error) {
	sql, args, err := sq.
		Select("*").
		From(friendshipsTable).
		Where(squirrel.Eq{"user_id": uid}).
		ToSql()

	if err != nil {
		return nil, fmt.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to select: %w", err)
	}

	var res []Friendship
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, fmt.Errorf("failed to scan rows: %w", err)
	}

	return res, nil
}

func (r friendshipRepository) AreFriends(ctx context.Context, uid1, uid2 string) (bool, error) {
	sql, args, err := sq.
		Select("COUNT(1)").
		From(friendshipsTable).
		Where(squirrel.Eq{"user_id": uid1, "friend_id": uid2}).
		ToSql()

	if err != nil {
		return false, fmt.Errorf("failed to create select query: %w", err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return false, fmt.Errorf("failed to select: %w", err)
	}

	var res int
	err = pgxscan.ScanOne(&res, rows)
	if err != nil {
		return false, fmt.Errorf("failed to scan rows: %w", err)
	}

	// if res > 1 LOG

	return res > 0, nil
}

func (r friendshipRepository) AddFriendship(ctx context.Context, requesterID, userID string) error {
	sql, args, err := sq.
		Insert(friendshipsTable).
		Columns("user_id", "friend_id").
		Values(requesterID, userID).
		Values(userID, requesterID).
		ToSql()

	if err != nil {
		return errors.Errorf("failed to create insert query: %w", err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return errors.Errorf("failed to exec: %w", err)
	}

	return nil
}
