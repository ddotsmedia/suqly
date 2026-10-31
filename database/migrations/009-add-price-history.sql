-- Table for listing price history
CREATE TABLE IF NOT EXISTS listing_price_history (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AED',
  changed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id, changed_at)
);
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON listing_price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON listing_price_history(changed_at DESC);
