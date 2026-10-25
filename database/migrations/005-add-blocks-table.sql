-- Create blocks table for feature: report-block-user (feature 5)
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  blocking_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_block_pair UNIQUE (blocking_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocking_user ON blocks(blocking_user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_user ON blocks(blocked_user_id);
