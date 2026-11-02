-- Count how many times each listing page is viewed (shown to the seller).
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
