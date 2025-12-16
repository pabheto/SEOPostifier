# Stripe Integration Setup Guide

This guide explains how to set up and configure the Stripe integration for subscription plans.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook signing secret

# Stripe Price IDs
# Create products and prices in Stripe Dashboard, then add the price IDs here
STRIPE_PRICE_ID_BASIC_MONTHLY=price_...
STRIPE_PRICE_ID_BASIC_ANNUAL=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_ANNUAL=price_...
STRIPE_PRICE_ID_AGENCY_MONTHLY=price_...
STRIPE_PRICE_ID_AGENCY_ANNUAL=price_...

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000 # Your frontend URL
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

#### Option A: Automated Setup (Recommended)

Use the automated script to create all products and prices from your plan definitions:

```bash
pnpm stripe:create-plans
```

This script will:

- Read plan definitions from `src/modules/subscriptions/plans/plans.definition.ts`
- Create Stripe products for each plan (except FREE)
- Create monthly and annual prices for each plan
- Use metadata to identify existing products/prices and avoid duplicates
- Output the price IDs in `.env` format for easy copy-paste

**Requirements:**

- `STRIPE_SECRET_KEY` must be set in your `.env` file
- The script uses the plan identifier as metadata to prevent duplicates

**Output:**
The script will display all created/existing price IDs in a format ready to add to your `.env` file.

#### Option B: Manual Setup

1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Create products for each plan:
   - **Basic Plan** (Monthly and Annual)
   - **Premium Plan** (Monthly and Annual)
   - **Agency Plan** (Monthly and Annual)

3. For each product, create two prices:
   - One for monthly billing
   - One for annual billing

4. Copy the Price IDs and add them to your `.env` file

### 2. Configure Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/subscriptions/webhook`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET` in your `.env` file

## API Endpoints

### Create Checkout Session

```
POST /subscriptions/checkout
Authorization: Bearer <JWT_TOKEN>
Body: {
  "plan": "basic" | "premium" | "agency",
  "billingPeriod": "monthly" | "annual"
}
```

Returns:

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Webhook Endpoint

```
POST /subscriptions/webhook
Headers: {
  "stripe-signature": "..."
}
```

This endpoint is called by Stripe automatically. No authentication required.

### Cancel Subscription

```
POST /subscriptions/cancel
Authorization: Bearer <JWT_TOKEN>
```

### Customer Portal

```
GET /subscriptions/portal
Authorization: Bearer <JWT_TOKEN>
```

Returns a URL to the Stripe customer portal where users can manage their subscriptions.

## Testing

### Using Stripe CLI (Recommended for Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:4000/subscriptions/webhook
   ```
4. Copy the webhook signing secret from the output and add it to `.env`
5. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Test Cards

Use Stripe test cards for testing:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

See more: https://stripe.com/docs/testing

## Subscription Flow

1. User selects a plan and billing period
2. Frontend calls `POST /subscriptions/checkout` with plan details
3. Backend creates Stripe checkout session and returns URL
4. User is redirected to Stripe checkout
5. After payment, Stripe sends webhook to `/subscriptions/webhook`
6. Backend updates subscription in database
7. User is redirected back to frontend success page

## Database Schema

The `UserSubscription` schema includes the following Stripe-related fields:

- `stripeCustomerId`: Stripe customer ID
- `stripeSubscriptionId`: Stripe subscription ID
- `stripePriceId`: Stripe price ID
- `stripeStatus`: Subscription status (active, canceled, past_due, etc.)

## Notes

- The webhook endpoint must be publicly accessible
- Use HTTPS in production
- The webhook endpoint does not require authentication (Stripe handles this via signature verification)
- Raw body parsing is enabled in `main.ts` to support webhook signature verification



