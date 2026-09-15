-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'merchant', 'staff');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'on_hold', 'sold', 'expired');
CREATE TYPE category_name AS ENUM ('goods', 'property', 'motors', 'jobs', 'services', 'businesses');
CREATE TYPE emirate AS ENUM ('dubai', 'abudhabi', 'sharjah', 'ajman', 'umm_al_quwain', 'ras_al_khaimah', 'fujairah', 'al_ain');

-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'buyer',

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,

  -- Profile
  display_name VARCHAR(100),
  avatar_url VARCHAR(255),
  bio TEXT,
  language VARCHAR(5) DEFAULT 'en',

  -- Seller metrics
  seller_score DECIMAL(3,1),
  response_rate DECIMAL(3,1),

  -- Compliance
  terms_accepted BOOLEAN DEFAULT FALSE,
  privacy_accepted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_score CHECK (seller_score >= 0 AND seller_score <= 5),
  CONSTRAINT valid_response CHECK (response_rate >= 0 AND response_rate <= 100)
);

-- Listings table (core)
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Classification
  category category_name NOT NULL,
  subcategory VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Location
  emirate emirate NOT NULL,
  community VARCHAR(100),
  precise_location GEOMETRY(POINT, 4326),
  public_location VARCHAR(255),

  -- Pricing
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'AED',

  -- Status
  status listing_status DEFAULT 'draft',
  published_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Freshness
  last_confirmed_at TIMESTAMP,
  days_since_confirmed INT,

  -- SEO
  slug VARCHAR(255) UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_id ON listings(user_id);
CREATE INDEX idx_category_emirate ON listings(category, emirate);
CREATE INDEX idx_status ON listings(status);
CREATE INDEX idx_published_at ON listings(published_at DESC);
CREATE SPATIAL INDEX idx_location ON listings USING GIST(precise_location);

-- Listing images
CREATE TABLE listing_images (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  thumbnail_url VARCHAR(255) NOT NULL,
  full_url VARCHAR(255) NOT NULL,

  original_filename VARCHAR(255),
  compressed_size_bytes INT,

  has_defects BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,

  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listing_images ON listing_images(listing_id);

-- Listing attributes (specs)
CREATE TABLE listing_attributes (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  attribute_key VARCHAR(50),
  attribute_value VARCHAR(255)
);

CREATE INDEX idx_listing_attributes ON listing_attributes(listing_id);

-- Messages
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL REFERENCES users(id),
  recipient_id BIGINT NOT NULL REFERENCES users(id),

  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_listing ON messages(listing_id, created_at DESC);
CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);

-- Saved searches
CREATE TABLE saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(100),
  filters JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

-- Reviews
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id),
  reviewer_id BIGINT NOT NULL REFERENCES users(id),
  seller_id BIGINT NOT NULL REFERENCES users(id),

  rating DECIMAL(2,1),
  comment TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Moderation queue
CREATE TABLE moderation_queue (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id),

  reason VARCHAR(100),
  flagged_by_user_id BIGINT REFERENCES users(id),
  flagged_at TIMESTAMP DEFAULT NOW(),

  status VARCHAR(50) DEFAULT 'pending',
  reviewer_id BIGINT REFERENCES users(id),
  rejection_reason TEXT,
  reviewed_at TIMESTAMP
);

CREATE INDEX idx_moderation_status ON moderation_queue(status);
CREATE INDEX idx_moderation_flagged_at ON moderation_queue(flagged_at DESC);

COMMIT;
