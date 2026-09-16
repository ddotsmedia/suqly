# Suqly Advanced Features - Implementation Guide

**Commit**: `406e316`  
**Deployment Date**: September 16, 2026  
**Status**: ✅ Production Ready

---

## 🎯 Features Overview

This release adds 6 AI-powered features to Suqly marketplace:

1. **Visual Search** — Find items by uploading images
2. **Live Commerce** — Real-time selling via livestreams
3. **AI Fraud Detection** — Seller risk scoring & verification
4. **AI Pricing** — Intelligent price suggestions
5. **AI Descriptions** — Auto-generate titles & descriptions EN/AR
6. **Conversational Search** — Natural language search queries

---

## 🏗️ Architecture

### Backend Services (6 new)

#### 1. Fraud Detection Service
**File**: `backend/src/services/fraud-detection.service.ts`

**Methods**:
- `calculateSellerScore(userId)` → Returns 0-100 risk score
- `checkListingRisk(listingId)` → Flags suspicious listings
- `verifySellerIdentity(userId, docType, fileUrl)` → ID verification
- `verifySellerBank(userId, iban)` → Bank verification
- `detectFraudPatterns()` → Scan all listings for fraud

**Fraud Factors**:
- Account age (< 7 days = 25 points)
- No ID verification (20 points)
- Rapid listing creation (> 5 per day = 20 points)
- Suspiciously low prices (< AED 50 = 15 points)
- High refund rate (> 20% = 20 points)
- Low seller ratings (< 2.0 = 25 points)

**Risk Levels**:
- `low` (0-30) — No action
- `low_medium` (30-50) — Watch
- `medium` (50-70) — Require verification
- `high` (70-100) — Auto-suspend until verified

---

#### 2. AI Description Service
**File**: `backend/src/services/ai-description.service.ts`

**Methods**:
- `generateFromImage(imageBuffer)` → Full title + description EN/AR
- `generateProductTitle(imageBuffer, category?)` → Title only
- `detectItemCondition(imageBuffer)` → new/like-new/used/heavily-used
- `extractProductFeatures(imageBuffer)` → Brand, color, size, materials
- `generateArabicDescription(englishDesc)` → Translate to Arabic
- `improveDescription(rawDescription)` → Polish user-written text

**Uses**: Claude 3.5 Sonnet Vision API

**Response Example**:
```json
{
  "title_en": "iPhone 13 Pro Max 256GB Sierra Blue - Excellent Condition",
  "title_ar": "آيفون 13 برو ماكس 256GB أزرق سييرا - حالة ممتازة",
  "description_en": "Excellent condition iPhone...",
  "description_ar": "آيفون في حالة ممتازة...",
  "confidence": 0.92
}
```

---

#### 3. Price Prediction Service
**File**: `backend/src/services/price-prediction.service.ts`

**Methods**:
- `suggestPrice(listingId)` → Price recommendation with confidence
- `getPriceTrend(category, emirate?)` → 30-day trend analysis
- `getMarketStats(category, emirate?)` → Market average/min/max

**Adjustments**:
- Condition: new +5%, like-new +3%, heavily-used -8%
- Seller rating: > 4.5 +3%, < 3.0 -3%
- Listing age: > 30 days -5%
- Demand: high demand → boost price

**Response Example**:
```json
{
  "suggestedPrice": 2500,
  "currentPrice": 2000,
  "marketAverage": 2400,
  "marketMin": 1800,
  "marketMax": 3200,
  "confidence": 0.87,
  "factors": {
    "condition_like_new": true,
    "high_seller_rating": true,
    "high_demand": true
  }
}
```

---

#### 4. Visual Search Service
**File**: `backend/src/services/visual-search.service.ts`

**Methods**:
- `generateImageVector(imageBuffer)` → 1536-dim vector embedding
- `searchSimilarListings(vector, limit)` → Top N similar items
- `indexImageVector(listingId, imageUrl, vector)` → Add to OpenSearch
- `getVisuallyRelatedListings(listingId)` → Related items
- `analyzeImageQuality(imageBuffer)` → Quality score 0-100

**Technologies**:
- Claude Vision API for feature extraction
- OpenSearch for vector similarity (KNN search)
- Cosine similarity scoring (0-1 scale)

**Response Example**:
```json
{
  "results": [
    {
      "listing": { "id": 123, "title": "iPhone 13..." },
      "similarity_score": 0.94
    },
    {
      "listing": { "id": 456, "title": "iPhone 13 Pro..." },
      "similarity_score": 0.89
    }
  ]
}
```

---

#### 5. Live Commerce Service
**File**: `backend/src/services/live-commerce.service.ts`

**Methods**:
- `createSession(sellerId, title, products, startTime)` → New session
- `startSession(sessionId)` → Go live
- `endSession(sessionId)` → Finalize & generate report
- `sendChatMessage(sessionId, userId, message)` → Send message
- `createLiveOrder(sessionId, userId, listingId)` → Buy during live
- `getSessionAnalytics(sessionId)` → Stats & ROI

**Agora Integration**:
- Generates token for video/audio streaming
- Supports up to 10,000 concurrent viewers
- 1:1 seller-to-viewer ratio for interactions

**Session Data**:
```json
{
  "id": 1,
  "sellerId": 42,
  "title": "Amazing Electronics Sale",
  "status": "live",
  "channelName": "live_xxxxx",
  "viewerCount": 523,
  "products": [
    { "listingId": 100, "price": 500, "discount": 10 }
  ],
  "totalSales": 12500,
  "totalOrders": 25
}
```

---

#### 6. Search NLP Service
**File**: `backend/src/services/search-nlp.service.ts`

**Methods**:
- `parseConversationalQuery(query)` → Extract structured filters
- `generateSearchSuggestions(query)` → Suggest similar searches
- `refineSearchResults(results, feedback)` → Re-rank based on feedback

**Parse Examples**:
```
Query: "Show me red iPhones under 1000 in Dubai"
→ {
    category: "mobile_phones",
    emirate: "dubai",
    priceMax: 1000,
    keywords: ["iphone", "red"],
    sortBy: "price_asc"
  }

Query: "Best used cars 2020 to 2023 Abu Dhabi"
→ {
    category: "vehicles",
    emirate: "abu_dhabi",
    condition: "used",
    keywords: ["2020", "2023"],
    sortBy: "newest"
  }
```

---

### Frontend Components (5 new)

#### 1. VisualSearchUpload.tsx
**Path**: `frontend/src/components/VisualSearchUpload.tsx`

Drag-drop interface for image search:
- Accept JPG, PNG, WebP
- Show similarity scores
- Grid results layout
- Save search feature

```jsx
<VisualSearchUpload />
```

#### 2. LiveSessionCard.tsx
**Path**: `frontend/src/components/LiveSessionCard.tsx`

Card component for displaying live sessions:
- Live/scheduled badges
- Pulsing "LIVE" indicator
- Viewer count
- "Join Live" button

```jsx
<LiveSessionCard session={liveSession} />
```

#### 3. PriceSuggestionCard.tsx
**Path**: `frontend/src/components/PriceSuggestionCard.tsx`

AI price recommendation card:
- Suggested vs current price
- Market range (min/avg/max)
- Trend indicator (up/down)
- Update price button

```jsx
<PriceSuggestionCard suggestion={priceSuggestion} />
```

#### 4. SellerVerificationBadges.tsx
**Path**: `frontend/src/components/SellerVerificationBadges.tsx`

Trust & verification display:
- ✓ ID Verified
- ✓ Bank Verified
- ✓ Phone Verified
- Trust score (0-100)
- Risk level (low/medium/high)

```jsx
<SellerVerificationBadges verification={status} />
```

#### 5. AIDescriptionEditor.tsx
**Path**: `frontend/src/components/AIDescriptionEditor.tsx`

AI description generation & editing:
- Show generated EN/AR
- Edit before saving
- Regenerate option
- Character counters

```jsx
<AIDescriptionEditor listingId={123} onSave={handleSave} />
```

---

### Frontend Pages (3 new)

#### 1. /live
**Path**: `frontend/src/app/live/page.tsx`

Browse live sessions:
- Live now section (with pulsing badge)
- Upcoming sessions (scheduled)
- Filter by category
- Search sellers

#### 2. /search/visual
**Path**: `frontend/src/app/search/visual/page.tsx`

Visual search interface:
- Large drop zone
- Browse for image
- Show results grid
- Info cards about features

#### 3. /seller/verification
**Path**: `frontend/src/app/seller/verification/page.tsx`

Multi-step verification flow:
- Step 1: Phone ✓ (pre-verified)
- Step 2: ID document upload
- Step 3: Bank IBAN verification
- Progress bar
- Trust score display

---

## 📊 Database Schema

### 8 New Tables

**listings_images** — Image vectors for visual search
```sql
- id (PK)
- listing_id (FK)
- image_url
- image_vector (1536-dim vector)
- thumbnail_url
- position
- created_at
```

**fraud_scores** — Seller risk assessment
```sql
- id (PK)
- seller_id (FK)
- score (0-100)
- risk_level (low/medium/high/blocked)
- factors (JSONB: rapid_listings, high_refunds, etc.)
- verified_id, verified_bank, verified_phone (boolean)
- created_at, updated_at
```

**live_sessions** — Livestream data
```sql
- id (PK)
- seller_id (FK)
- title, description
- agora_channel_id
- status (scheduled/live/ended)
- start_time, end_time
- viewer_count, max_viewers
- products (JSONB array)
- total_sales_amount, total_orders
```

**live_chat_messages** — Chat in livestreams
```sql
- id (PK)
- session_id (FK)
- user_id (FK)
- message_text
- message_type (chat/question/buy)
- created_at
```

**price_suggestions** — AI price recommendations
```sql
- id (PK)
- listing_id (FK)
- suggested_price, current_price
- market_average, market_min, market_max
- similar_listings_count
- confidence_score
- factors (JSONB)
```

**ai_descriptions** — Generated descriptions
```sql
- id (PK)
- listing_id (FK)
- generated_title_en, generated_title_ar
- generated_description_en, generated_description_ar
- confidence_score
- model_version
```

**seller_verification_docs** — ID/bank documents
```sql
- id (PK)
- seller_id (FK)
- doc_type (passport/emirates_id/license)
- file_url
- status (pending/approved/rejected)
- ai_confidence
- verified_by_admin (FK nullable)
```

**search_queries** — Search analytics
```sql
- id (PK)
- user_id (FK nullable)
- query_text
- query_vector (1536-dim for semantic search)
- results_count
- clicked_listing_id (FK nullable)
- conversion (boolean)
```

---

## 🔌 API Endpoints (58 Total)

### Visual Search
```
POST /api/search/visual
  Body: { image: File }
  Returns: [{ listing, similarity_score }]

GET /api/listings/{id}/visual-related
  Returns: [{ listing, similarity_score }]
```

### AI Descriptions
```
POST /api/listings/{id}/ai-description
  Returns: { title_en, title_ar, description_en, description_ar, confidence }

POST /api/listings/{id}/ai-description?regenerate=true
  Returns: (same as above, regenerated)
```

### Price Suggestions
```
GET /api/prices/suggest?listing_id=123
  Returns: { suggestedPrice, marketAverage, confidence, factors }

GET /api/prices/trend?category=phones&emirate=dubai
  Returns: { trend, priceChange, data: [{date, avgPrice, volume}] }
```

### Fraud Detection
```
GET /api/sellers/{id}/fraud-score
  Returns: { score, riskLevel, factors, verified_id, verified_bank }

POST /api/sellers/{id}/verify-identity
  Body: { docType, file }
  Returns: { status, confidence, verified }

POST /api/fraud/check-listing
  Body: { listingId }
  Returns: { riskScore, flags, shouldFlag }
```

### Live Commerce
```
POST /api/live-sessions/create
  Body: { title, description, productIds, startTime }
  Returns: { sessionId, agoraToken, channelName }

GET /api/live-sessions
  Query: { status, categoryId, sortBy }
  Returns: [{ session, viewerCount, totalSales }]

POST /api/live-sessions/{id}/start
  Returns: { status: "live", viewerUrl }

POST /api/live-sessions/{id}/chat
  Body: { message, action }
  Returns: { messageId, timestamp }

POST /api/live-sessions/{id}/buy
  Body: { listingId, quantity, offerPrice }
  Returns: { orderId, paymentIntent }
```

### Search NLP
```
POST /api/search/conversational
  Body: { query: "Show me iPhones under 1000 in Dubai" }
  Returns: { intent, category, emirate, priceMax, filters }

GET /api/search/suggestions?q=iphones
  Returns: ["iPhone 13", "iPhone 13 Pro", "iPhone 12"]
```

---

## 🚀 Deployment

### Automated (GitHub Actions)
1. Push to `main` → GitHub Actions triggered
2. Build backend Docker image
3. Build frontend Docker image
4. Push to GHCR (ghcr.io/ddotsmedia/suqly/*)
5. SSH into VPS
6. Pull images & restart containers
7. Run database migrations
8. Health checks
9. Notify on success/failure

**Monitor**: https://github.com/ddotsmedia/suqly/actions

### Manual (VPS)
```bash
ssh deploy@194.164.151.202
cd /home/deploy/suqly

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run typeorm migration:run

# Health checks
curl https://api.suqly.com/health
curl https://suqly.com
```

---

## 🔐 Environment Variables Required

```env
# Claude Vision API (AI Descriptions & Visual Search)
ANTHROPIC_API_KEY=sk-ant-...

# Agora Live Commerce
AGORA_APP_ID=xxxxxxxxxxxxxxxx
AGORA_APP_CERTIFICATE=xxxxxxxxxxxxxxxx

# OpenSearch (Vector Search)
OPENSEARCH_URL=http://opensearch:9200
OPENSEARCH_PASSWORD=strong_password

# AWS Rekognition (ID Verification)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=us-east-1
```

---

## 📈 Features by User Type

### Buyers
- ✅ Visual search (upload image → find similar)
- ✅ Conversational search ("iPhones under 1000")
- ✅ Browse live sessions
- ✅ Join livestreams & chat
- ✅ See seller trust score
- ✅ View price trends

### Sellers
- ✅ AI-generate titles & descriptions
- ✅ Get price suggestions
- ✅ See fraud score & how to improve
- ✅ ID/bank verification
- ✅ Go live with livestream
- ✅ Sell during livestream
- ✅ View session analytics

### Admins
- ✅ Auto-flag suspicious listings
- ✅ Review fraud cases
- ✅ Verify seller documents
- ✅ Dashboard with KPIs

---

## ⚙️ Configuration

### Enable Features

All features enabled by default. To disable:

```env
# Disable visual search
DISABLE_VISUAL_SEARCH=true

# Disable live commerce
DISABLE_LIVE_COMMERCE=true

# Disable AI descriptions
DISABLE_AI_DESCRIPTIONS=true

# Disable fraud detection
DISABLE_FRAUD_DETECTION=true
```

---

## 🧪 Testing

### Local Testing
```bash
cd C:\web\Suqly

# Backend
npm run dev (backend)

# Frontend
npm run dev (frontend)

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

### Test Features

**Visual Search**:
- Upload image at http://localhost:3000/search/visual
- Should return 20 similar listings

**Price Suggestion**:
- Any listing → AI suggests price

**AI Descriptions**:
- Upload listing image → AI generates title + description

**Fraud Detection**:
- New seller → score 50+
- No ID → score +20
- Rapid listings → score +20

**Live Commerce**:
- Visit http://localhost:3000/live
- Create session → Get Agora token

---

## 📊 Analytics

Each feature tracks metrics:

- **Visual Search**: search volume, clicks, conversions
- **Prices**: suggested vs actual price adoption
- **Descriptions**: usage rate, quality feedback
- **Live Sessions**: viewers, sales, duration
- **Fraud**: detection accuracy, false positives

Access via `/api/admin/analytics`

---

## 🔄 Updates & Maintenance

### Weekly
- Review fraud alerts
- Monitor visual search relevance
- Check price suggestions accuracy

### Monthly
- Update ML models
- Review live commerce metrics
- Refine fraud detection rules

### Quarterly
- Evaluate feature adoption
- Upgrade AI models
- Add new categories/rules

---

## 📝 Next Steps (Tier 3)

1. **Mobile Apps** — React Native iOS/Android
2. **Subscriptions** — Premium seller plans
3. **Video Listings** — Full video upload & hosting
4. **Shipping Integration** — Aramex/DHL APIs
5. **Advanced Analytics** — Seller dashboard

---

## 💬 Support

- **Issues**: https://github.com/ddotsmedia/suqly/issues
- **Docs**: See `CLAUDE.md` for conventions
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Operations**: See `MAINTENANCE.md`

---

**Status**: ✅ Production Ready  
**Commit**: 406e316  
**Deployed**: September 16, 2026
