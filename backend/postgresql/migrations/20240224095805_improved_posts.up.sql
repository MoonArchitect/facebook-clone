ALTER TABLE posts ADD like_count INT DEFAULT 0;
ALTER TABLE posts ADD share_count INT DEFAULT 0;
ALTER TABLE posts DROP COLUMN comments;

CREATE TABLE comments (
    id              UUID PRIMARY KEY,
    owner_id        UUID        NOT NULL references users(id),
    post_id         UUID        NOT NULL references posts(id),
    reply_count     INT         NOT NULL DEFAULT 0,
    text            TEXT        NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_owner_id_index on posts(owner_id);
CREATE INDEX comments_post_id_index on comments(post_id);
