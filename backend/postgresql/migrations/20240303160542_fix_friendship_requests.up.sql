ALTER TABLE pending_friendship_requests DROP CONSTRAINT pending_friendship_requests_pkey;
ALTER TABLE pending_friendship_requests ADD id BIGSERIAL PRIMARY KEY;
ALTER TABLE pending_friendship_requests ADD CONSTRAINT pending_friendship_requests_unique_id_pair UNIQUE (user_id, friend_id);
