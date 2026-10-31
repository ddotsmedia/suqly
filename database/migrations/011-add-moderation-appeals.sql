-- Moderation appeals and reporter notices
ALTER TABLE moderation_queue ADD COLUMN IF NOT EXISTS appeal_status VARCHAR(50);
ALTER TABLE moderation_queue ADD COLUMN IF NOT EXISTS appeal_reason TEXT;
ALTER TABLE moderation_queue ADD COLUMN IF NOT EXISTS appeal_at TIMESTAMP;
ALTER TABLE moderation_queue ADD COLUMN IF NOT EXISTS appeal_decision_note TEXT;
ALTER TABLE moderation_queue ADD COLUMN IF NOT EXISTS appeal_decided_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_moderation_appeal_status ON moderation_queue (appeal_status);
