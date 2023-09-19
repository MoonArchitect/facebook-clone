package repositories

import "github.com/Masterminds/squirrel"

var sq = squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar)

const (
	credentialsTable = "credentials"
	userTable        = "users"
	profilesTable    = "profiles"
	friendshipsTable = "friendships"
)
