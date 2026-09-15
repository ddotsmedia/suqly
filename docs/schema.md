# Suqly Database Schema

## Overview

Suqly uses PostgreSQL 15 with PostGIS extension for location-based services. The schema is optimized for marketplace operations with proper indexing, constraints, and relationships.

## Tables

### users
Stores user profiles for buyers, sellers, merchants, and staff.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| username | VARCHAR(50) | UNIQUE NOT NULL | Alphanumeric only |
| email | VARCHAR(100) | UNIQUE NOT NULL | For notifications |
| phone | VARCHAR(20) | NULLABLE | SMS contact |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed |
| role | ENUM | DEFAULT 'buyer' | buyer/seller/merchant/staff |
| email_verified | BOOLEAN | DEFAULT FALSE | Email confirmation |
| phone_verified | BOOLEAN | DEFAULT FALSE | SMS OTP verified |
| id_verified | BOOLEAN | DEFAULT FALSE | Government ID verified |
| display_name | VARCHAR(100) | NULLABLE | Public name |
| avatar_url | VARCHAR(255) | NULLABLE | Wasabi CDN URL |
| bio | TEXT | NULLABLE | User bio/description |
| language | VARCHAR(5) | DEFAULT 'en' | en or ar |
| seller_score | DECIMAL(3,1) | NULLABLE | 0-5 rating |
| response_rate | DECIMAL(3,1) | NULLABLE | 0-100 percentage |
| terms_accepted | BOOLEAN | DEFAULT FALSE | T&C acceptance |
| privacy_accepted | BOOLEAN | DEFAULT FALSE | Privacy policy |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- username (UNIQUE)
- email (UNIQUE)
- role (for filtering staff/sellers)

**Constraints:**
- seller_score: 0 ≤ value ≤ 5
- response_rate: 0 ≤ value ≤ 100

---

### listings
Main table for all marketplace listings.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| user_id | BIGINT | FK → users | Listing owner |
| category | ENUM | NOT NULL | goods/property/motors/jobs/services/businesses |
| subcategory | VARCHAR(50) | NULLABLE | Category-specific |
| title | VARCHAR(255) | NOT NULL | Listing title |
| description | TEXT | NULLABLE | Full description |
| emirate | ENUM | NOT NULL | dubai/abudhabi/sharjah/ajman/umm_al_quwain/ras_al_khaimah/fujairah/al_ain |
| community | VARCHAR(100) | NULLABLE | Neighborhood/community |
| precise_location | GEOMETRY(POINT, 4326) | NULLABLE | PostGIS point (private) |
| public_location | VARCHAR(255) | NULLABLE | Approximate location text |
| price | DECIMAL(12,2) | NULLABLE | Listing price |
| currency | VARCHAR(3) | DEFAULT 'AED' | ISO 4217 code |
| status | ENUM | DEFAULT 'draft' | draft/pending_review/active/on_hold/sold/expired |
| published_at | TIMESTAMP | NULLABLE | Publish timestamp |
| expires_at | TIMESTAMP | NULLABLE | Expiration (90 days) |
| last_confirmed_at | TIMESTAMP | NULLABLE | Seller confirmation |
| days_since_confirmed | INT | GENERATED | Days since confirm |
| slug | VARCHAR(255) | UNIQUE | URL-friendly slug |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- user_id (for filtering by seller)
- (category, emirate) (composite for search)
- status (for listing state)
- published_at DESC (for fresh sorting)
- SPATIAL on precise_location (PostGIS)

**Notes:**
- Slug format: `title-kebab-case-xxxx` (random suffix prevents collisions)
- precise_location kept private; public_location shown to buyers
- Status workflow: draft → pending_review → active → on_hold/sold/expired

---

### listing_images
Image storage for listings with multi-image support.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| listing_id | BIGINT | FK → listings CASCADE | Cascade on listing delete |
| thumbnail_url | VARCHAR(255) | NOT NULL | Wasabi CDN thumbnail |
| full_url | VARCHAR(255) | NOT NULL | Wasabi CDN full resolution |
| original_filename | VARCHAR(255) | NULLABLE | Original file name |
| compressed_size_bytes | INT | NULLABLE | Optimized file size |
| has_defects | BOOLEAN | DEFAULT FALSE | Defect disclosure flag |
| is_edited | BOOLEAN | DEFAULT FALSE | Photoshopped/filtered |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Indexes:**
- listing_id (for filtering images by listing)

**Notes:**
- Both URLs point to Wasabi S3 CDN
- Timestamps tracked for freshness signals
- Defect flags visible to buyers for transparency

---

### messages
Direct messaging between buyers and sellers.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| listing_id | BIGINT | FK → listings CASCADE | Conversation context |
| sender_id | BIGINT | FK → users | Who sent message |
| recipient_id | BIGINT | FK → users | Who receives message |
| content | TEXT | NOT NULL | Message body |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMP | NULLABLE | When read |
| created_at | TIMESTAMP | DEFAULT NOW() | Send timestamp |

**Indexes:**
- (listing_id, created_at DESC) for thread loading
- (sender_id, recipient_id) for conversation lookup

**Notes:**
- Thread indexed by both listing_id and user pair
- Read tracking for notification features
- Ordered by created_at for chronological display

---

### saved_searches
Buyer-side saved search preferences for discovery.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| user_id | BIGINT | FK → users CASCADE | Buyer's search |
| name | VARCHAR(100) | NULLABLE | Search name ("iPhones Dubai") |
| filters | JSONB | NULLABLE | Search parameters |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:**
- user_id

**JSONB Schema (filters):**
```json
{
  "category": "goods",
  "emirate": "dubai",
  "community": "marina",
  "price_min": 100,
  "price_max": 5000,
  "search_terms": "iphone"
}
```

---

### reviews
Seller ratings and feedback from transactions.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| listing_id | BIGINT | FK → listings | (Optional) Review context |
| reviewer_id | BIGINT | FK → users | Buyer leaving review |
| seller_id | BIGINT | FK → users | Seller being reviewed |
| rating | DECIMAL(2,1) | NULLABLE | 1.0-5.0 stars |
| comment | TEXT | NULLABLE | Review text |
| created_at | TIMESTAMP | DEFAULT NOW() | Review date |

**Notes:**
- listing_id optional (reviews can be non-listing-specific)
- Ratings feed into seller_score calculation
- P1 feature (table created, endpoints not yet built)

---

### moderation_queue
Admin workflow for flagged listings.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incremented |
| listing_id | BIGINT | FK → listings CASCADE | Flagged listing |
| reason | VARCHAR(100) | NULLABLE | Flag reason |
| flagged_by_user_id | BIGINT | FK → users (NULLABLE) | Who flagged (null = system) |
| flagged_at | TIMESTAMP | DEFAULT NOW() | Flag timestamp |
| status | VARCHAR(50) | DEFAULT 'pending' | pending/approved/rejected |
| reviewer_id | BIGINT | FK → users (NULLABLE) | Admin who reviewed |
| rejection_reason | TEXT | NULLABLE | Why rejected |
| reviewed_at | TIMESTAMP | NULLABLE | Review timestamp |

**Indexes:**
- status (for filtering queue)
- flagged_at DESC (for chronological sorting)

**Workflow:**
```
pending → approved (listing activated) ✓
       ↘ rejected (listing held, notification sent) ✗
```

---

## Enums

### user_role
```sql
'buyer'     - Can view, message, saved searches
'seller'    - Can create, manage, receive messages
'merchant'  - Multi-listing seller with inventory tools
'staff'     - Suqly admin, moderation access
```

### listing_status
```sql
'draft'         - Unpublished, not visible
'pending_review' - Awaiting moderation approval
'active'        - Published, searchable
'on_hold'       - Temporarily unavailable
'sold'          - Transaction completed
'expired'       - 90-day listing duration ended
```

### category_name
```sql
'goods'      - Consumer items, electronics, furniture
'property'   - Real estate sales/rentals
'motors'     - Vehicles and automotive
'jobs'       - Employment listings
'services'   - Professional services
'businesses' - Business sales/franchises
```

### emirate
```sql
'dubai'                - Dubai
'abudhabi'             - Abu Dhabi
'sharjah'              - Sharjah
'ajman'                - Ajman
'umm_al_quwain'        - Umm Al Quwain
'ras_al_khaimah'       - Ras Al Khaimah
'fujairah'             - Fujairah
'al_ain'               - Al Ain
```

---

## Relationships

```
users
  ├─ 1:N → listings (one user has many listings)
  ├─ 1:N → messages.sender_id (one user sends many messages)
  └─ 1:N → messages.recipient_id (one user receives many messages)

listings
  ├─ N:1 → users (many listings by one user)
  ├─ 1:N → listing_images (one listing has many images)
  ├─ 1:N → messages (one listing has many messages)
  └─ 1:1 → moderation_queue (one listing flagged)

listing_images
  └─ N:1 → listings (many images per listing)

messages
  ├─ N:1 → listings
  ├─ N:1 → users (sender)
  └─ N:1 → users (recipient)

moderation_queue
  ├─ N:1 → listings
  ├─ N:1 → users (flagged_by)
  └─ N:1 → users (reviewer)
```

---

## Query Patterns

### Search Listings
```sql
SELECT * FROM listings
WHERE status = 'active'
  AND emirate = 'dubai'
  AND category = 'goods'
  AND price BETWEEN 100 AND 5000
ORDER BY published_at DESC
LIMIT 20 OFFSET 0;
```

### Get Messages for Thread
```sql
SELECT * FROM messages
WHERE listing_id = $1
  AND (
    (sender_id = $2 AND recipient_id = $3)
    OR (sender_id = $3 AND recipient_id = $2)
  )
ORDER BY created_at ASC;
```

### Get Seller Stats
```sql
SELECT
  COUNT(*) as total_listings,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_listings,
  AVG(l.price) as avg_price,
  MAX(l.published_at) as last_listed
FROM listings l
WHERE l.user_id = $1;
```

### Moderation Queue
```sql
SELECT mq.*, l.title, l.user_id, u.display_name
FROM moderation_queue mq
JOIN listings l ON l.id = mq.listing_id
JOIN users u ON u.id = l.user_id
WHERE mq.status = 'pending'
ORDER BY mq.flagged_at DESC;
```

---

## Performance Considerations

### Indexing Strategy
- ✅ Foreign keys indexed (auto)
- ✅ Search columns indexed (category, emirate, status)
- ✅ Sort column indexed (published_at)
- ✅ Spatial index for PostGIS geometry

### Typical Query Costs
- Listing search: ~100ms (full table scan → index scan)
- Message retrieval: ~50ms (indexed thread lookup)
- User lookup: ~5ms (indexed by ID)

### Future Optimizations (P2+)
- Denormalized seller_score in listings for faster sorting
- Partitioning listings by emirate/category for very large datasets
- ReadReplica for analytics queries
- Cache layer (Redis) for popular listings

---

## Migration History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-09-15 | Initial S01 schema |
| (P1) | TBD | Add review calculations, search indexing |
| (P2) | TBD | Add payment, subscription tables |
| (P3+) | TBD | Analytics, audit log tables |

---

**Last Updated**: September 15, 2026  
**Version**: 0.1.0  
**Database**: PostgreSQL 15 + PostGIS
