-- P2 Phase: Payments, Push, Admin, Seller Profile

-- Transactions table (Stripe payments)
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Push subscriptions (Firebase)
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token VARCHAR(500) NOT NULL,
  topics TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Admin logs
CREATE TABLE admin_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50),
  target_type VARCHAR(50),
  target_id BIGINT,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);

-- Admin roles
CREATE TABLE admin_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seller profile extensions (add columns to users table)
ALTER TABLE users ADD COLUMN seller_bio VARCHAR(500);
ALTER TABLE users ADD COLUMN avg_response_time_minutes INTEGER DEFAULT 24;
ALTER TABLE users ADD COLUMN premium_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN profile_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN featured_until TIMESTAMP;

-- Notifications table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  body TEXT,
  topic VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

COMMIT;
