package repositories

import "github.com/Masterminds/squirrel"

var sq = squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar)

const (
	credentialsTable        = "credentials"
	userTable               = "users"
	profilesTable           = "profiles"
	friendshipsTable        = "friendships"
	friendshipRequestsTable = "pending_friendship_requests"
	postsTable              = "posts"
	commentsTable           = "comments"
	postLikesTable          = "post_likes"
)
