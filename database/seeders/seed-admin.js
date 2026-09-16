const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'suqly_dev',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');

    // Check if admin already exists
    const result = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@suqly.com']
    );

    if (result.rows.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Insert admin user
    await client.query(`
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
      )
    `);

    console.log('✓ Admin user created: admin@suqly.com / Admin@123456');

    // Insert moderator user
    await client.query(`
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
      )
    `);

    console.log('✓ Moderator user created: moderator@suqly.com / Admin@123456');

  } catch (err) {
    if (err.message.includes('user_role') || err.message.includes('enum')) {
      console.log('⚠ Role enum might need updating (this is expected if already added)');
    } else {
      console.error('Error:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

seed().then(() => {
  console.log('✅ Seeding complete');
  process.exit(0);
});
