package repositories

import "github.com/go-errors/errors"

var (
	ErrorBuildQuery     = errors.New("failed to build query")
	ErrorQueryRows      = errors.New("failed to query rows")
	ErrorQueryExec      = errors.New("failed to execute query")
	ErrorScanRows       = errors.New("failed to scan rows")
	ErrorNoRows         = errors.New("no rows were found")
	ErrorNoRowsAffected = errors.New("no rows were affected by the query")

	ErrorDuplicateUserEmail = errors.New("user email already exists")
)

func dbError(base *errors.Error, cause error) error {
	newBase := errors.New(base)
	return errors.Join(newBase, cause)
}
