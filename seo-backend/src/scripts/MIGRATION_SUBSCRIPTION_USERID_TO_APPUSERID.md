# Subscription userId to appUserId Migration

## Overview

This migration updates the subscription schema to use `appUserId` instead of `userId` to properly link subscriptions with the application user ID rather than the database `_id`.

## Changes Made

### Schema Changes

- **File**: `src/modules/subscriptions/schemas/subscription.schema.ts`
- **Change**: Renamed `userId` field to `appUserId`

### Service Layer Changes

- **File**: `src/modules/subscriptions/subscription.service.ts`
- **Changes**: Updated all methods to use `appUserId` parameter and field reference
  - `getSubscriptionForUser(appUserId)`
  - `createSubscriptionForUser(appUserId)`
  - `getOrCreateSubscriptionForUser(appUserId)`
  - `changePlanForUserSubscription(appUserId, plan)`
  - `updateSubscriptionFromStripe()` - now reads `metadata.appUserId`
  - `updateSubscriptionCustomerId(appUserId, customerId)`
  - `cancelSubscription(appUserId)`

### Stripe Integration Changes

- **File**: `src/modules/subscriptions/stripe/stripe.service.ts`
- **Changes**:
  - `createCheckoutSession()` now accepts `appUserId` instead of `userId`
  - Stripe metadata now stores `appUserId` instead of `userId`
  - Both checkout session and subscription metadata updated

### Controller Changes

- **File**: `src/modules/subscriptions/subscriptions.controller.ts`
- **Changes**: Webhook handler for `customer.subscription.deleted` now reads `metadata.appUserId`

## Running the Migration

### Prerequisites

- Ensure the backend application has database access
- Make sure no users are actively creating subscriptions during migration
- Backup your database before running the migration

### Steps

1. **Backup the database**:

   ```bash
   # For MongoDB
   mongodump --uri="mongodb://localhost:27017/your-database" --out=/path/to/backup
   ```

2. **Run the migration script**:

   ```bash
   cd seo-backend
   npx ts-node src/scripts/migrate-subscription-userid-to-appuserid.ts
   ```

3. **Verify the migration**:
   The script will output:
   - Number of subscriptions migrated
   - Success/error count
   - Post-migration verification

4. **Expected output**:

   ```
   Starting subscription migration: userId -> appUserId
   Found X subscriptions to migrate
   ✓ Migrated subscription 507f1f77bcf86cd799439011: userId="abc123" -> appUserId="abc123"
   ...

   === Migration Summary ===
   Total subscriptions processed: X
   Successfully migrated: X
   Errors: 0

   === Post-Migration Status ===
   Subscriptions with old userId field: 0
   Subscriptions with new appUserId field: X

   ✓ Migration completed successfully!
   ```

## Rollback Plan

If you need to rollback:

1. **Restore from backup**:

   ```bash
   mongorestore --uri="mongodb://localhost:27017/your-database" /path/to/backup
   ```

2. **Revert code changes**:
   ```bash
   git revert <commit-hash>
   ```

## Important Notes

- The `appUserId` is already being used throughout the authentication system
- The `@CurrentUser()` decorator already provides `user.id` as the `appUserId`
- This change makes the field name consistent with the actual data being stored
- New Stripe subscriptions will automatically use the new metadata field name
- Existing Stripe subscriptions won't be updated automatically - they will continue to work but new webhook events should include the new metadata

## Testing

After migration, verify:

1. **Existing subscriptions work**:
   - Users can view their subscription: `GET /subscriptions/current`
   - Users can see their usage: included in the same endpoint

2. **New subscriptions work**:
   - Create a checkout session: `POST /subscriptions/checkout`
   - Complete payment in Stripe
   - Verify webhook updates subscription correctly

3. **Subscription operations work**:
   - Cancel subscription: `POST /subscriptions/cancel`
   - Access customer portal: `GET /subscriptions/portal`

## Questions?

If you encounter issues during migration, check:

- Database connection is working
- All subscription documents have a valid userId field
- No concurrent writes to subscriptions during migration
