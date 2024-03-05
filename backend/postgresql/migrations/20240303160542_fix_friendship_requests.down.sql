ALTER TABLE friendships DROP CONSTRAINT friendships_unique_id_pair;
ALTER TABLE friendships DROP COLUMN id;
ALTER TABLE friendships DROP COLUMN created_at;
ALTER TABLE friendships ADD CONSTRAINT friendships_pkey PRIMARY KEY (user_id);

ALTER TABLE pending_friendship_requests DROP CONSTRAINT pending_friendship_requests_unique_id_pair;
ALTER TABLE pending_friendship_requests DROP COLUMN id;
ALTER TABLE pending_friendship_requests ADD CONSTRAINT pending_friendship_requests_pkey PRIMARY KEY (user_id);
