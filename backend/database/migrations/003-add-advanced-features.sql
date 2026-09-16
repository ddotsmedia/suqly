-- Migration: Add advanced features (visual search, live commerce, fraud detection, AI pricing, descriptions)
-- Timestamp: 2026-09-16

-- Install pgvector extension for image embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Listings images with vector embeddings for visual search
CREATE TABLE listings_images (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_vector vector(1536),
  thumbnail_url VARCHAR(500),
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listings_images_listing_id ON listings_images(listing_id);
CREATE INDEX idx_listings_images_vector ON listings_images USING ivfflat (image_vector vector_cosine_ops);

-- Seller fraud scores and risk assessment
CREATE TABLE fraud_scores (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score FLOAT DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'low',
  factors JSONB DEFAULT '{}',
  verified_id BOOLEAN DEFAULT FALSE,
  verified_bank BOOLEAN DEFAULT FALSE,
  verified_phone BOOLEAN DEFAULT FALSE,
  id_rejection_count INT DEFAULT 0,
  refund_rate FLOAT DEFAULT 0,
  rapid_listings_flag BOOLEAN DEFAULT FALSE,
  price_anomaly_flag BOOLEAN DEFAULT FALSE,
  last_calculated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_scores_seller_id ON fraud_scores(seller_id);
CREATE INDEX idx_fraud_scores_risk_level ON fraud_scores(risk_level);

-- Live commerce sessions (livestream selling)
CREATE TABLE live_sessions (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  agora_channel_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  viewer_count INT DEFAULT 0,
  max_viewers INT DEFAULT 0,
  products JSONB DEFAULT '[]',
  total_sales_amount DECIMAL(10,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  language VARCHAR(5) DEFAULT 'en',
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_sessions_seller_id ON live_sessions(seller_id);
CREATE INDEX idx_live_sessions_status ON live_sessions(status);
CREATE INDEX idx_live_sessions_start_time ON live_sessions(start_time);

-- Live session chat and interactions
CREATE TABLE live_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'chat',
  action_type VARCHAR(50),
  listing_id INT REFERENCES listings(id),
  quantity INT,
  offer_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_chat_messages_session_id ON live_chat_messages(session_id);
CREATE INDEX idx_live_chat_messages_user_id ON live_chat_messages(user_id);
CREATE INDEX idx_live_chat_messages_created_at ON live_chat_messages(created_at);

-- AI-generated price suggestions
CREATE TABLE price_suggestions (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  suggested_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  market_average DECIMAL(10,2),
  market_min DECIMAL(10,2),
  market_max DECIMAL(10,2),
  similar_listings_count INT DEFAULT 0,
  confidence_score FLOAT,
  factors JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_suggestions_listing_id ON price_suggestions(listing_id);

-- AI-generated descriptions from images
CREATE TABLE ai_descriptions (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  original_image_url VARCHAR(500),
  generated_title_en VARCHAR(255),
  generated_title_ar VARCHAR(255),
  generated_description_en TEXT,
  generated_description_ar TEXT,
  confidence_score FLOAT,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_descriptions_listing_id ON ai_descriptions(listing_id);

-- Seller identity verification documents
CREATE TABLE seller_verification_docs (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  ai_confidence FLOAT,
  manual_verified BOOLEAN DEFAULT FALSE,
  verified_by_admin INT REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seller_verification_docs_seller_id ON seller_verification_docs(seller_id);
CREATE INDEX idx_seller_verification_docs_status ON seller_verification_docs(status);

-- Search queries with semantic embeddings for learning
CREATE TABLE search_queries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  query_text VARCHAR(500) NOT NULL,
  query_vector vector(1536),
  results_count INT,
  clicked_listing_id INT REFERENCES listings(id) ON DELETE SET NULL,
  clicked_position INT,
  conversion BOOLEAN DEFAULT FALSE,
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX idx_search_queries_vector ON search_queries USING ivfflat (query_vector vector_cosine_ops);

-- Trending listings cache (materialized view for performance)
CREATE TABLE trending_listings (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  views_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  inquiries_count INT DEFAULT 0,
  trend_score FLOAT DEFAULT 0,
  rank_position INT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trending_listings_period ON trending_listings(period);
CREATE INDEX idx_trending_listings_listing_id ON trending_listings(listing_id);

-- Live session analytics
CREATE TABLE live_session_analytics (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  viewer_peak INT DEFAULT 0,
  total_viewer_hours DECIMAL(10,2) DEFAULT 0,
  avg_watch_duration_seconds INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  products_viewed INT DEFAULT 0,
  add_to_cart_count INT DEFAULT 0,
  purchase_count INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_session_analytics_session_id ON live_session_analytics(session_id);
