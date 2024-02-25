CREATE TABLE post_likes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL references users(id),
    post_id         UUID NOT NULL references posts(id)
);

CREATE INDEX post_likes_post_id_index ON post_likes(post_id);
CREATE INDEX post_likes_user_id_post_id_index ON post_likes(user_id, post_id);
