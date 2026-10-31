-- Add JSON attributes column for structured listing attributes
ALTER TABLE listings ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_listing_attributes ON listings USING GIN(attributes);
