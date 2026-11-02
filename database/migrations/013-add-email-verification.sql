-- Email verification: store a hash of the one-time token (never the raw token) and its expiry.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token_hash ON users (email_verification_token_hash);
