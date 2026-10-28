-- Add refresh_count column for feature: listing-age-refresh (feature 6)
-- This column tracks how many times a listing has been bumped/refreshed
ALTER TABLE listings ADD COLUMN IF NOT EXISTS refresh_count INTEGER DEFAULT 0;
