-- Add admin and moderator roles to user_role enum
ALTER TYPE user_role ADD VALUE 'admin' BEFORE 'buyer';
ALTER TYPE user_role ADD VALUE 'moderator' BEFORE 'buyer';

-- Create admin user with secure password hash
-- Password: Admin@123456
INSERT INTO users (
  username,
  email,
  phone,
  password_hash,
  display_name,
  role,
  email_verified,
  phone_verified,
  terms_accepted,
  privacy_accepted,
  created_at
) VALUES (
  'admin',
  'admin@suqly.com',
  '+971501234567',
  '$2b$10$/3ZVAIC2VmZ76gJXaiBL6eVWLu143/zBhEnvsITo7CQnH7nVrdZdi',
  'Admin User',
  'admin',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create moderator user (for testing)
-- Password: Admin@123456
INSERT INTO users (
  username,
  email,
  phone,
  password_hash,
  display_name,
  role,
  email_verified,
  phone_verified,
  terms_accepted,
  privacy_accepted,
  created_at
) VALUES (
  'moderator',
  'moderator@suqly.com',
  '+971501234568',
  '$2b$10$/3ZVAIC2VmZ76gJXaiBL6eVWLu143/zBhEnvsITo7CQnH7nVrdZdi',
  'Moderator User',
  'moderator',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  NOW()
) ON CONFLICT (email) DO NOTHING;
