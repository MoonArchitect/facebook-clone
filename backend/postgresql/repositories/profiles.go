package repositories

import (
	"context"

	"github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-errors/errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Profile struct {
	Id          string `db:"id"`
	Name        string `db:"name"`
	Username    string `db:"username"`
	ThumbnailID string `db:"thumbnail_id"`
	BannerID    string `db:"banner_id"`
	Public      bool   `db:"public"`
}

type ProfileRepository interface {
	CreateProfile(ctx context.Context, p Profile) error
	GetByID(ctx context.Context, uid string) (*Profile, error)
	GetManyByID(ctx context.Context, uids []string) ([]Profile, error)
	GetByUsername(ctx context.Context, username string) (*Profile, error)
	EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error
	EditProfileCover(ctx context.Context, uid, coverID string) error
}

type profileRepository struct {
	dbPool *pgxpool.Pool
}

func NewProfileRepository(dbPool *pgxpool.Pool) ProfileRepository {
	return &profileRepository{
		dbPool,
	}
}

func (r profileRepository) CreateProfile(ctx context.Context, p Profile) error {
	sql, args, err := sq.
		Insert(profilesTable).
		Columns("id", "name", "username", "thumbnail_id", "banner_id", "public").
		Values(p.Id, p.Name, p.Username, p.ThumbnailID, p.BannerID, p.Public).
		ToSql()

	if err != nil {
		return dbError(ErrorBuildQuery, err)
	}

	_, err = r.dbPool.Exec(ctx, sql, args...)
	if err != nil {
		return dbError(ErrorQueryExec, err)
	}
	// TODO if duplicate, or foreign key is not satisfied
	// else if pgerr := err.(*pgconn.PgError); pgerr.Code == "23505" {
	// 	return "", fmt.Errorf("duplicate email")
	// }

	return nil
}

func (r profileRepository) GetByID(ctx context.Context, uid string) (*Profile, error) {
	sql, args, err := sq.
		Select("*").
		From(profilesTable).
		Where(squirrel.Eq{"id": uid}).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res Profile
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, dbError(ErrorNoRows, err)
	} else if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return &res, nil
}

func (r profileRepository) GetManyByID(ctx context.Context, uids []string) ([]Profile, error) {
	sql, args, err := sq.
		Select("*").
		From(profilesTable).
		Where(squirrel.Eq{"id": uids}).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res []Profile
	err = pgxscan.ScanAll(&res, rows)
	if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return res, nil
}

func (r profileRepository) GetByUsername(ctx context.Context, username string) (*Profile, error) {
	sql, args, err := sq.
		Select("*").
		From(profilesTable).
		Where(squirrel.Eq{"username": username}).
		ToSql()

	if err != nil {
		return nil, dbError(ErrorBuildQuery, err)
	}

	rows, err := r.dbPool.Query(ctx, sql, args...)
	if err != nil {
		return nil, dbError(ErrorQueryRows, err)
	}

	var res Profile
	err = pgxscan.ScanOne(&res, rows)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, dbError(ErrorNoRows, err)
	} else if err != nil {
		return nil, dbError(ErrorScanRows, err)
	}

	return &res, nil
}

func (r profileRepository) EditProfileThumbnail(ctx context.Context, uid, thumbnailID string) error {
	sql, args, err := sq.
		Update(profilesTable).
		Set("thumbnail_id", thumbnailID).
		Where(squirrel.Eq{"id": uid}).
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

func (r profileRepository) EditProfileCover(ctx context.Context, uid, coverID string) error {
	sql, args, err := sq.
		Update(profilesTable).
		Set("banner_id", coverID).
		Where(squirrel.Eq{"id": uid}).
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
