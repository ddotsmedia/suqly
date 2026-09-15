# Suqly API Reference

Base URL: `http://localhost:3001` (development)

All requests accept and return JSON. Authenticated endpoints require Bearer token in Authorization header.

## Authentication

### Send OTP
```
POST /auth/login
Content-Type: application/json

{
  "phone": "+971501234567"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "success": true,
    "message": "OTP sent to +971501234567"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Verify OTP & Get Token
```
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+971501234567",
  "code": "123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "+971501234567@suqly.local",
      "phone": "+971501234567",
      "displayName": null,
      "role": "buyer"
    }
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "success": true
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Users

### Get User Profile
```
GET /users/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "displayName": "Ahmed Al-Mansoori",
    "avatarUrl": "https://...",
    "role": "seller",
    "sellerScore": 4.8,
    "responseRate": 95,
    "createdAt": "2026-09-01T10:00:00Z"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Seller Stats
```
GET /users/:id/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": 1,
    "totalListings": 15,
    "activeListings": 10,
    "sellerScore": 4.8,
    "responseRate": 95
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Update User Profile
```
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Ahmed Al-Mansoori",
  "bio": "Professional seller in Dubai",
  "language": "ar"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated user object */ },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Listings

### List Listings
```
GET /listings?category=goods&emirate=dubai&priceMin=100&priceMax=5000&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "iPhone 14 Pro",
      "category": "goods",
      "emirate": "dubai",
      "price": 2500,
      "currency": "AED",
      "status": "active",
      "publishedAt": "2026-09-15T10:00:00Z",
      "images": [
        {
          "id": 1,
          "thumbnailUrl": "https://...",
          "fullUrl": "https://..."
        }
      ],
      "user": {
        "id": 1,
        "displayName": "Ahmed",
        "role": "seller"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Listing by ID
```
GET /listings/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "title": "iPhone 14 Pro",
    "description": "Excellent condition, all accessories...",
    "category": "goods",
    "emirate": "dubai",
    "community": "Marina",
    "publicLocation": "Dubai Marina",
    "price": 2500,
    "currency": "AED",
    "status": "active",
    "images": [ /* ... */ ],
    "user": { /* ... */ }
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Listing by Slug
```
GET /listings/slug/:slug

Response: 200 OK
{ /* same as by ID */ }
```

### Create Listing
```
POST /listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "iPhone 14 Pro",
  "description": "Excellent condition",
  "category": "goods",
  "emirate": "dubai",
  "community": "Marina",
  "price": 2500,
  "currency": "AED"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 2,
    "slug": "iphone-14-pro-a1b2",
    "status": "draft",
    "title": "iPhone 14 Pro",
    /* ... */
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Update Listing
```
PUT /listings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "iPhone 14 Pro - Updated",
  "price": 2300
}

Response: 200 OK
{ /* updated listing */ }
```

### Delete Listing
```
DELETE /listings/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { "id": 1 },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Publish Listing
```
POST /listings/:id/publish
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "active",
    "publishedAt": "2026-09-15T18:00:00Z",
    "expiresAt": "2026-12-14T18:00:00Z"
    /* ... */
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Add Image to Listing
```
POST /listings/:id/images
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://images.suqly.com/listings/1-abc123.webp",
  "thumbnailUrl": "https://images.suqly.com/listings/1-abc123-thumb.webp"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "listingId": 1,
    "thumbnailUrl": "https://...",
    "fullUrl": "https://...",
    "uploadedAt": "2026-09-15T18:00:00Z"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Messages

### Get Conversations
```
GET /messages/conversations
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "partnerId": 5,
      "lastMessage": {
        "id": 10,
        "content": "Is it still available?",
        "createdAt": "2026-09-15T16:00:00Z"
      },
      "messages": [ /* all messages with this user */ ]
    }
  ],
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Listing Messages
```
GET /messages/listing/:listingId?page=1

Response: 200 OK
{
  "success": true,
  "data": [ /* messages for this listing */ ],
  "pagination": { "page": 1, "total": 5, "limit": 50 },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Conversation with User
```
GET /messages/:userId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [ /* all messages with this user */ ],
  "pagination": { "page": 1, "total": 12, "limit": 50 },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Moderation

### Flag Listing
```
POST /moderation/flag/:listingId
Content-Type: application/json

{
  "reason": "Spam"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "listingId": 1,
    "reason": "Spam",
    "status": "pending",
    "flaggedAt": "2026-09-15T18:00:00Z"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Moderation Queue (Admin Only)
```
GET /moderation/queue?status=pending&page=1
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [ /* flagged listings */ ],
  "pagination": { "page": 1, "total": 15, "limit": 20, "pages": 1 },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Get Moderation Stats (Admin Only)
```
GET /moderation/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "pending": 5,
    "approved": 120,
    "rejected": 8,
    "total": 133
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Approve Flag (Admin Only)
```
POST /moderation/approve/:flagId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "reviewedAt": "2026-09-15T18:00:00Z"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### Reject Flag (Admin Only)
```
POST /moderation/reject/:flagId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "False report"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "rejectionReason": "False report",
    "reviewedAt": "2026-09-15T18:00:00Z"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Health & Info

### Health Check
```
GET /health

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 3600.5,
    "version": "0.1.0"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### API Info
```
GET /info

Response: 200 OK
{
  "success": true,
  "data": {
    "name": "Suqly API",
    "description": "Suqly UAE Marketplace API",
    "version": "0.1.0",
    "environment": "development"
  },
  "timestamp": "2026-09-15T18:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid phone number",
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Token required",
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Admin access required",
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Listing not found",
  "timestamp": "2026-09-15T18:00:00Z"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": "2026-09-15T18:00:00Z"
}
```

---

**Documentation**: Swagger UI at http://localhost:3001/api/docs  
**Last Updated**: September 15, 2026  
**Version**: 0.1.0
