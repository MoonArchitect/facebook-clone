CREATE TABLE users (
    id              UUID PRIMARY KEY        DEFAULT gen_random_uuid(),
    email           VARCHAR(512) UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

CREATE TABLE profiles (
    id              UUID PRIMARY KEY references users(id),
    username        VARCHAR(36)     NOT NULL UNIQUE,
    name            VARCHAR(48)     NOT NULL,
    thumbnail_id    VARCHAR(128)    NOT NULL,
    banner_id       VARCHAR(128)    NOT NULL,
    public          BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE TABLE friendships (
    user_id         UUID PRIMARY KEY  references users(id),
    friend_id       UUID              references users(id)
);

CREATE TABLE pending_friendship_requests (
    user_id         UUID PRIMARY KEY  references users(id),
    friend_id       UUID              references users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id              UUID PRIMARY KEY,
    owner_id        UUID references users(id),
    post_text       TEXT            NOT NULL DEFAULT '',
    post_images     VARCHAR(128)[]  NOT NULL DEFAULT ARRAY[]::VARCHAR(128)[],
    comments        JSONB           NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


