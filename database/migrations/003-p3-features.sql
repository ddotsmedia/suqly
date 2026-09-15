-- P3 Phase: Stripe Connect, Subscriptions, Search Analytics, Audit Logging

-- Stripe Connect Accounts
CREATE TABLE stripe_connect_accounts (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  payout_enabled BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  transfers_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_stripe_seller ON stripe_connect_accounts(seller_id);

-- Payouts
CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payout_id VARCHAR(255),
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  failure_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payouts_seller ON payouts(seller_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Subscription Tiers
CREATE TABLE subscription_tiers (
  id BIGSERIAL PRIMARY KEY,
  tier_name VARCHAR(50) UNIQUE,
  price_per_month DECIMAL(10, 2),
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seller Subscriptions
CREATE TABLE seller_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier_id BIGINT REFERENCES subscription_tiers(id),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_seller_subscriptions_seller ON seller_subscriptions(seller_id);

-- Saved Searches
CREATE TABLE saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255),
  filters JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

-- Search Analytics
CREATE TABLE search_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  query VARCHAR(255),
  filters JSONB,
  result_count INTEGER,
  clicked_listing_id BIGINT,
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);

-- Audit Logs
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action VARCHAR(50),
  table_name VARCHAR(50),
  record_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Insert subscription tiers
INSERT INTO subscription_tiers (tier_name, price_per_month, features) VALUES
('free', 0, '{"name":"Free","listing_limit":10,"featured_limit":2,"badge":null,"visibility_boost":0,"analytics":false,"priority_support":false}'),
('bronze', 99, '{"name":"Bronze","listing_limit":50,"featured_limit":5,"badge":"bronze","visibility_boost":10,"analytics":false,"priority_support":false}'),
('silver', 249, '{"name":"Silver","listing_limit":200,"featured_limit":15,"badge":"silver","visibility_boost":30,"analytics":true,"priority_support":false}'),
('gold', 499, '{"name":"Gold","listing_limit":9999,"featured_limit":50,"badge":"gold","visibility_boost":50,"analytics":true,"priority_support":true}');

COMMIT;
