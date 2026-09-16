-- Migration: Add feature flags system for feature toggles
-- Timestamp: 2026-09-16

CREATE TABLE feature_flags (
  id SERIAL PRIMARY KEY,
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, description, category, enabled) VALUES
-- Payments (disabled by default - free tier)
('STRIPE_PAYMENTS', 'Enable Stripe payment processing', 'payments', false),
('COMMISSION_SYSTEM', 'Calculate & track commissions on sales', 'payments', false),
('PAYOUT_SYSTEM', 'Enable seller payouts & settlements', 'payments', false),
('SELLER_SUBSCRIPTIONS', 'Premium seller subscription tiers', 'payments', false),

-- Seller features (enabled - free tier)
('LIVE_COMMERCE', 'Enable livestream selling', 'seller', true),
('SELLER_ANALYTICS', 'Show seller dashboard analytics', 'seller', true),
('BULK_LISTING_UPLOAD', 'Allow CSV/Excel bulk uploads', 'seller', false),

-- Buyer features (enabled - free tier)
('VISUAL_SEARCH', 'Enable image-based search', 'buyer', true),
('AI_DESCRIPTIONS', 'Auto-generate product descriptions', 'buyer', true),
('SAVED_SEARCHES', 'Save searches and get alerts', 'buyer', false),
('PRICE_TRACKING', 'Track price changes on items', 'buyer', false),

-- Admin features
('FRAUD_DETECTION', 'Enable AI fraud scoring', 'admin', true),
('MODERATION_QUEUE', 'Show moderation dashboard', 'admin', true),
('MANUAL_VERIFICATION', 'Manually verify sellers', 'admin', true);

CREATE AUDIT LOG TABLE FOR FEATURE FLAG CHANGES
CREATE TABLE feature_flags_audit (
  id SERIAL PRIMARY KEY,
  flag_name VARCHAR(100) NOT NULL,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_by INT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (flag_name) REFERENCES feature_flags(flag_name)
);

CREATE INDEX idx_feature_flags_audit_flag ON feature_flags_audit(flag_name);
CREATE INDEX idx_feature_flags_audit_changed_at ON feature_flags_audit(changed_at);
