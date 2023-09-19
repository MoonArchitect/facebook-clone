CREATE TABLE credentials (
    id  SERIAL PRIMARY KEY,
    email       VARCHAR(128) NOT NULL UNIQUE,
    hash        BYTEA NOT NULL,
    salt        BYTEA NOT NULL,
    user_id     UUID references users(id) NOT NULL
);