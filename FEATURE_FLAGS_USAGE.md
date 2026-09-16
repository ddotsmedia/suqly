# Feature Flags Usage Guide

## Admin Panel

### Access Feature Flags
Navigate to: `/admin/settings`

All 10 feature flags grouped by category:
- **💳 Payments** (4) — Disabled by default
- **🏪 Seller** (3) — Enabled by default
- **👤 Buyer** (4) — Enabled by default
- **⚙️ Admin** (3) — Enabled by default

### Toggle Features
1. Click toggle switch next to each feature
2. Changes apply immediately (60-second cache)
3. Or bulk enable/disable all in category

---

## Using Feature Flags in Components

### Option 1: Async (Recommended)
```jsx
'use client';
import { featureFlags } from '@/lib/feature-flags';
import { useEffect, useState } from 'react';

export function CheckoutFlow() {
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    featureFlags.isEnabled('STRIPE_PAYMENTS').then(setPaymentsEnabled);
  }, []);

  return (
    <div>
      {paymentsEnabled ? (
        <StripeCheckout />
      ) : (
        <div className="p-4 bg-gray-100 rounded">
          Payment system coming soon!
        </div>
      )}
    </div>
  );
}
```

### Option 2: React Hook
```jsx
'use client';
import { useFeatureFlag } from '@/lib/feature-flags';

export function SellerDashboard() {
  const paymentsEnabled = useFeatureFlag('STRIPE_PAYMENTS');
  const commissionsEnabled = useFeatureFlag('COMMISSION_SYSTEM');

  return (
    <div>
      {paymentsEnabled && <PaymentStats />}
      {commissionsEnabled && <CommissionBreakdown />}
      <OrderHistory /> {/* Always show */}
    </div>
  );
}
```

### Option 3: Convenience Methods
```jsx
'use client';
import { featureFlags } from '@/lib/feature-flags';

export async function EarningsPage() {
  const payments = await featureFlags.payments();

  return (
    <div>
      {payments.stripe && <StripeStatus />}
      {payments.payouts && <PayoutHistory />}
      {payments.subscriptions && <SubscriptionTiers />}
    </div>
  );
}
```

### Option 4: Backend Guard
```typescript
// In NestJS controller
import { Injectable } from '@nestjs/common';
import { FeatureFlagsService } from '../features/feature-flags.service';

@Injectable()
export class StripeService {
  constructor(private flags: FeatureFlagsService) {}

  async processPayment(amount: number) {
    const paymentsEnabled = await this.flags.getFlag('STRIPE_PAYMENTS');
    
    if (!paymentsEnabled) {
      throw new Error('Payment system not yet available');
    }

    // Process payment...
  }
}
```

---

## Feature Flags Reference

### Payment Features (Disabled for Free Tier)

#### STRIPE_PAYMENTS
- Enables Stripe payment processing
- Shows payment methods in checkout
- Required for: `COMMISSION_SYSTEM`, `PAYOUT_SYSTEM`

#### COMMISSION_SYSTEM
- Calculates marketplace commission on sales
- Tracks earnings per transaction
- Requires: `STRIPE_PAYMENTS`

#### PAYOUT_SYSTEM
- Enables seller payouts to bank accounts
- Shows payout schedule and history
- Requires: `STRIPE_PAYMENTS`

#### SELLER_SUBSCRIPTIONS
- Premium seller subscription tiers
- Shows subscription benefits and pricing
- Requires: `STRIPE_PAYMENTS`

---

### Seller Features (Enabled)

#### LIVE_COMMERCE
- Livestream selling and interactions
- Shows "Go Live" button on seller dashboard
- Integrates with Agora SDK

#### SELLER_ANALYTICS
- Seller dashboard with metrics
- Views, clicks, conversion tracking
- Daily/weekly/monthly reports

#### BULK_LISTING_UPLOAD
- CSV/Excel bulk upload for listings
- Requires premium seller tier
- Future enhancement

---

### Buyer Features (Enabled)

#### VISUAL_SEARCH
- Image-based product search
- Shows /search/visual page
- Drag-drop and camera upload

#### AI_DESCRIPTIONS
- Auto-generated product descriptions
- Uses Claude Vision API
- Available in listing creation

#### SAVED_SEARCHES
- Save search queries with alerts
- Get notified when new items match
- Future enhancement

#### PRICE_TRACKING
- Price drop alerts on items
- Wishlist price history charts
- Future enhancement

---

### Admin Features (Enabled)

#### FRAUD_DETECTION
- AI-powered fraud scoring
- Auto-flags suspicious listings
- Shows in moderation queue

#### MODERATION_QUEUE
- Admin moderation dashboard
- Review flagged listings and sellers
- Approve/reject decisions

#### MANUAL_VERIFICATION
- Manually verify seller documents
- Override fraud scoring
- Show in admin dashboard

---

## Implementation Examples

### Hide Payment UI Until Enabled
```jsx
'use client';
import { useFeatureFlag } from '@/lib/feature-flags';

export function CheckoutPage() {
  const paymentsEnabled = useFeatureFlag('STRIPE_PAYMENTS');

  if (!paymentsEnabled) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Payment processing will be available soon. 
          You can message sellers about pricing.
        </p>
      </div>
    );
  }

  return <StripeCheckoutForm />;
}
```

### Conditional Seller Dashboard
```jsx
'use client';
import { useFeatureFlag } from '@/lib/feature-flags';

export function SellerDashboard() {
  const liveCommerceEnabled = useFeatureFlag('LIVE_COMMERCE');
  const analyticsEnabled = useFeatureFlag('SELLER_ANALYTICS');
  const paymentsEnabled = useFeatureFlag('STRIPE_PAYMENTS');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {liveCommerceEnabled && <GoLiveCard />}
      {analyticsEnabled && <AnalyticsDashboard />}
      {paymentsEnabled && <EarningsCard />}
      
      {/* Always show */}
      <ListingsCard />
      <MessagesCard />
    </div>
  );
}
```

### API Endpoint Protection
```typescript
@Get('seller/earnings')
async getEarnings(@Request() req) {
  // Check if payments are enabled
  if (!await this.flags.isPaymentEnabled()) {
    return {
      error: 'Feature not yet available',
      message: 'Payment features will be enabled soon',
    };
  }

  // Return earnings data
  return await this.earningsService.getEarnings(req.user.id);
}
```

---

## When to Enable Payment Features

### Recommended Milestones:
- ✅ Reached 10K+ active sellers
- ✅ Marketplace has 50K+ listings
- ✅ Processing 100+ transactions/day
- ✅ Legal/compliance reviewed
- ✅ Support team trained on payment issues

### Enable in This Order:
1. Enable `STRIPE_PAYMENTS` (base infrastructure)
2. Enable `COMMISSION_SYSTEM` (start earning)
3. Enable `PAYOUT_SYSTEM` (seller withdrawals)
4. Enable `SELLER_SUBSCRIPTIONS` (premium tiers)

Each can be enabled independently with batch toggle button.

---

## Testing Feature Flags

### Local Testing
```bash
# Simulate disabled payments
STRIPE_PAYMENTS=false npm run dev

# Check which features are enabled
curl http://localhost:3001/admin/settings/feature-flags
```

### In Components
```jsx
// Force flag to true for testing
const mockPaymentsEnabled = true;

// Or use feature flag hook
const paymentsEnabled = useFeatureFlag('STRIPE_PAYMENTS');
console.log('Payments enabled:', paymentsEnabled);
```

---

## Cache Management

Feature flags are cached for 60 seconds by default.

### Immediate Update
```javascript
// Clear cache and reload
import { featureFlags } from '@/lib/feature-flags';
featureFlags.clearCache();
```

### API Endpoint
```
POST /admin/settings/feature-flags/cache-clear
```

---

## Audit Log

All feature flag changes are logged in `feature_flags_audit` table:
- Flag name
- Old value → New value
- Changed by (admin user)
- Timestamp

View in database:
```sql
SELECT * FROM feature_flags_audit ORDER BY changed_at DESC LIMIT 20;
```

---

## Troubleshooting

### Features Not Showing After Toggle
1. Check cache: `POST /admin/settings/feature-flags/cache-clear`
2. Refresh browser (hard refresh: Ctrl+Shift+R)
3. Check database: `SELECT * FROM feature_flags WHERE flag_name = '...'`

### Payment Button Still Visible
1. Ensure `STRIPE_PAYMENTS` is disabled in admin panel
2. Check component uses `useFeatureFlag` hook or `featureFlags.isEnabled()`
3. Search codebase for hardcoded payment UI

### Incorrect Flag Status
1. Call `/admin/settings/feature-flags/check/FLAG_NAME` endpoint
2. Verify database value
3. Clear cache and retry

---

## API Reference

### GET /admin/settings/feature-flags
Returns all flags grouped by category
```json
{
  "payments": [...],
  "seller": [...],
  "buyer": [...],
  "admin": [...],
  "total_enabled": 6,
  "total_flags": 13
}
```

### POST /admin/settings/feature-flags/{flagName}/toggle
Toggle single flag
```json
Request: { "enabled": true }
Response: { "status": "updated", "flagName": "...", "enabled": true }
```

### POST /admin/settings/feature-flags/batch-toggle
Toggle entire category
```json
Request: { "category": "payments", "enabled": true }
Response: { "status": "updated", "category": "payments", "count": 4 }
```

### GET /admin/settings/feature-flags/check/{flagName}
Check single flag status
```json
Response: { "flagName": "STRIPE_PAYMENTS", "enabled": false }
```

---

## Best Practices

1. **Always check flags asynchronously** - Don't assume a flag value
2. **Provide fallback UI** - Show message instead of broken UI
3. **Use hooks in components** - Makes testing easier
4. **Document feature dependencies** - STRIPE_PAYMENTS → COMMISSION_SYSTEM
5. **Monitor cache invalidation** - Check logs for stale flags
6. **Test with flags disabled** - Ensure graceful degradation
7. **Communicate changes** - Tell users when features launch

---

Last Updated: September 16, 2026
