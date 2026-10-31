-- Add away_message columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS away_message TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS away_until TIMESTAMP;
