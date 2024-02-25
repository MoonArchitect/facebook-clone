ALTER TABLE posts DROP COLUMN like_count;
ALTER TABLE posts DROP COLUMN share_count;
ALTER TABLE posts ADD comments JSONB NOT NULL DEFAULT '[]'::jsonb;

DROP TABLE comments;

DROP INDEX posts_owner_id_index;
