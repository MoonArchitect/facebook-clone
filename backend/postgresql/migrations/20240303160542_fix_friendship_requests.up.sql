ALTER TABLE pending_friendship_requests DROP CONSTRAINT pending_friendship_requests_pkey;
ALTER TABLE pending_friendship_requests ADD id BIGSERIAL PRIMARY KEY;
ALTER TABLE pending_friendship_requests ADD CONSTRAINT pending_friendship_requests_unique_id_pair UNIQUE (user_id, friend_id);

ALTER TABLE friendships DROP CONSTRAINT friendships_pkey;
ALTER TABLE friendships ADD id BIGSERIAL PRIMARY KEY;
ALTER TABLE friendships ADD created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE friendships ADD CONSTRAINT friendships_unique_id_pair UNIQUE (user_id, friend_id);
