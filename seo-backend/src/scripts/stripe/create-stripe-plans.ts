import Stripe from 'stripe';
import {
  AVAILABLE_PLANS,
  PlanIdentifier,
} from '../../modules/subscriptions/plans/plans.definition';

interface CreatedPrice {
  planIdentifier: string;
  billingPeriod: 'monthly' | 'annual';
  priceId: string;
  amount: number;
}

/**
 * Script to automatically create Stripe products and prices from plan definitions.
 * Uses metadata to identify existing products/prices to avoid duplicates.
 */
async function createStripePlans() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
    console.error('   Please set it in your .env file');
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });

  console.log('🚀 Starting Stripe plans creation...\n');

  const createdPrices: CreatedPrice[] = [];
  const skippedPrices: CreatedPrice[] = [];

  // Filter out FREE plan as it doesn't need Stripe integration
  const plansToCreate = Object.values(AVAILABLE_PLANS).filter(
    (plan) => plan.identifier !== PlanIdentifier.FREE,
  );

  for (const plan of plansToCreate) {
    console.log(`\n📦 Processing plan: ${plan.name} (${plan.identifier})`);

    try {
      // Check if product already exists using metadata
      // List all products and filter by metadata (handle pagination)
      let existingProduct: Stripe.Product | undefined;
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore && !existingProduct) {
        const productsResponse = await stripe.products.list({
          limit: 100,
          ...(startingAfter && { starting_after: startingAfter }),
        });

        existingProduct = productsResponse.data.find(
          (p) => p.metadata?.plan_identifier === plan.identifier.toString(),
        );

        hasMore = productsResponse.has_more;
        if (productsResponse.data.length > 0) {
          startingAfter =
            productsResponse.data[productsResponse.data.length - 1].id;
        }
      }

      let product: Stripe.Product;

      if (existingProduct) {
        product = existingProduct;
        console.log(
          `   ✓ Product already exists: ${product.name} (${product.id})`,
        );
      } else {
        // Create new product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            plan_identifier: plan.identifier,
            ai_image_generation_per_month:
              plan.aiImageGenerationPerMonth.toString(),
            generated_words_per_month: plan.generatedWordsPerMonth.toString(),
            maximum_active_licenses: plan.maximumActiveLicenses.toString(),
          },
        });
        console.log(`   ✓ Created product: ${product.name} (${product.id})`);
      }

      // Create or update monthly price
      if (plan.monthlyPrice > 0) {
        const monthlyPrice = await createOrUpdatePrice(
          stripe,
          product.id,
          plan.identifier,
          'monthly',
          plan.monthlyPrice,
        );

        if (monthlyPrice.created) {
          createdPrices.push({
            planIdentifier: plan.identifier,
            billingPeriod: 'monthly',
            priceId: monthlyPrice.priceId,
            amount: plan.monthlyPrice,
          });
          console.log(
            `   ✓ Created monthly price: $${plan.monthlyPrice}/month (${monthlyPrice.priceId})`,
          );
        } else {
          skippedPrices.push({
            planIdentifier: plan.identifier,
            billingPeriod: 'monthly',
            priceId: monthlyPrice.priceId,
            amount: plan.monthlyPrice,
          });
          console.log(
            `   ⏭️  Monthly price already exists: ${monthlyPrice.priceId}`,
          );
        }
      }

      // Create or update annual price
      if (plan.anualPrice > 0) {
        const annualPrice = await createOrUpdatePrice(
          stripe,
          product.id,
          plan.identifier,
          'annual',
          plan.anualPrice,
        );

        if (annualPrice.created) {
          createdPrices.push({
            planIdentifier: plan.identifier,
            billingPeriod: 'annual',
            priceId: annualPrice.priceId,
            amount: plan.anualPrice,
          });
          console.log(
            `   ✓ Created annual price: $${plan.anualPrice}/year (${annualPrice.priceId})`,
          );
        } else {
          skippedPrices.push({
            planIdentifier: plan.identifier,
            billingPeriod: 'annual',
            priceId: annualPrice.priceId,
            amount: plan.anualPrice,
          });
          console.log(
            `   ⏭️  Annual price already exists: ${annualPrice.priceId}`,
          );
        }
      }
    } catch (error) {
      console.error(
        `   ❌ Error processing plan ${plan.name}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // Output summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  if (createdPrices.length > 0) {
    console.log('\n✅ Created Prices:');
    createdPrices.forEach((price) => {
      console.log(
        `   ${price.planIdentifier.toUpperCase()}_${price.billingPeriod.toUpperCase()}: ${price.priceId}`,
      );
    });
  }

  if (skippedPrices.length > 0) {
    console.log('\n⏭️  Existing Prices (skipped):');
    skippedPrices.forEach((price) => {
      console.log(
        `   ${price.planIdentifier.toUpperCase()}_${price.billingPeriod.toUpperCase()}: ${price.priceId}`,
      );
    });
  }

  // Generate .env format output
  console.log('\n' + '='.repeat(60));
  console.log('📝 Add these to your .env file:');
  console.log('='.repeat(60));
  console.log('\n# Stripe Price IDs');

  const allPrices = [...createdPrices, ...skippedPrices];
  allPrices.forEach((price) => {
    const envKey = `STRIPE_PRICE_ID_${price.planIdentifier.toUpperCase()}_${price.billingPeriod.toUpperCase()}`;
    console.log(`${envKey}=${price.priceId}`);
  });

  console.log('\n✅ Done!');
}

/**
 * Create or find existing price for a product
 */
async function createOrUpdatePrice(
  stripe: Stripe,
  productId: string,
  planIdentifier: string,
  billingPeriod: 'monthly' | 'annual',
  amount: number,
): Promise<{ priceId: string; created: boolean }> {
  // Check if price already exists using metadata
  const existingPrices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  // Look for existing price with matching metadata
  const existingPrice = existingPrices.data.find(
    (price) =>
      price.metadata?.plan_identifier === planIdentifier &&
      price.metadata?.billing_period === billingPeriod &&
      price.unit_amount === amount * 100, // Stripe uses cents
  );

  if (existingPrice) {
    return { priceId: existingPrice.id, created: false };
  }

  // Create new price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount * 100, // Convert to cents
    currency: 'usd',
    recurring: {
      interval: billingPeriod === 'monthly' ? 'month' : 'year',
    },
    metadata: {
      plan_identifier: planIdentifier,
      billing_period: billingPeriod,
    },
  });

  return { priceId: price.id, created: true };
}

// Run the script
createStripePlans()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
