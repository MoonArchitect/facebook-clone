# [UI Demo](https://moonarchitect.github.io/facebook-ui-clone/)

# under construction
Backend API
-  Supports user profiles, posts, comments, friendships 

Auth service
- custom email-password authentication server (stored in Postgres, salted, hashed), transported via JWT stored in cookies, uses RS512 signing algorithms to allow for fast validation by other services

Chat service
- AWS DynamoDB for persistent message storage
- Redis for caching and pub/sub
- websockets for server-client communication

Asset service
- 2 types: public & restricted
	- public assets do not require 
- if asset type changes from
	- private -> public: file is moved to public
- if accessing a restricted content (ie. photo of a friend whose profile is private) URL is signed by the server for this specific user
- assets are fetched by id (cdn.fb-clone.com/pu/{id}.jpg?{params} for public ones, .com/pr/{id} for private ones)
- assets access: client -> CDN -> asset service (resizing, authorization, etc.) -> S3

##### commands:
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate -path postgresql/migrations -database "postgres://{username}:{password}@0.0.0.0:5432/postgres?sslmode=disable" version



