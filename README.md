# [UI Demo](https://moonarchitect.github.io/facebook-ui-clone/)

# under construction

#### Commands:
install migrate util
```
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

manually check migration version 
```
migrate -path postgresql/migrations -database "postgres://{username}:{password}@0.0.0.0:5432/postgres?sslmode=disable" version
```


