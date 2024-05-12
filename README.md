# [UI Demo](https://moonarchitect.github.io/facebook-ui-clone/)

## Set up:
#### Backend:
Startup backend containers
```
docker compose -f compose.local.yaml up
```

install migrate util
```
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```
Initialize PosgreSQL
```
migrate -path postgresql/migrations -database "postgres://{username}:{password}@0.0.0.0:5432/postgres?sslmode=disable" up
```
Initialize DynamoDB
```
go run utils/init_dynamodb/create_dynamodb_tables.go
```

#### Frontend:
```
yarn       // download all packages
yarn serve // serve nextjs app
```


