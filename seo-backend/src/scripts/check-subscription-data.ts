import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { UserSubscription } from '../modules/subscriptions/schemas/subscription.schema';

/**
 * Script to check subscription data and indexes
 *
 * Run with: npm run build && node dist/scripts/check-subscription-data.js
 */
async function checkData() {
  console.log('Checking subscription data and indexes...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const subscriptionModel = app.get<Model<UserSubscription>>(
    getModelToken(UserSubscription.name),
  );

  try {
    const collection = subscriptionModel.collection;

    // Check indexes
    console.log('=== Current Indexes ===');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(
        `- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`,
      );
    });

    // Check total documents
    const totalDocs = await subscriptionModel.countDocuments();
    console.log(`\n=== Document Counts ===`);
    console.log(`Total subscriptions: ${totalDocs}`);

    // Check documents with old userId field
    const docsWithUserId = await subscriptionModel.countDocuments({
      userId: { $exists: true },
    });
    console.log(`Documents with userId field: ${docsWithUserId}`);

    // Check documents with appUserId field
    const docsWithAppUserId = await subscriptionModel.countDocuments({
      appUserId: { $exists: true },
    });
    console.log(`Documents with appUserId field: ${docsWithAppUserId}`);

    // Check documents with null appUserId
    const docsWithNullAppUserId = await subscriptionModel.countDocuments({
      appUserId: null,
    });
    console.log(`Documents with null appUserId: ${docsWithNullAppUserId}`);

    // Check documents with null userId
    const docsWithNullUserId = await subscriptionModel.countDocuments({
      userId: null,
    });
    console.log(`Documents with null userId: ${docsWithNullUserId}`);

    // Show sample documents
    if (totalDocs > 0) {
      console.log('\n=== Sample Documents ===');
      const samples = await collection
        .find({})
        .limit(3)
        .project({ _id: 1, appUserId: 1, userId: 1, plan: 1 })
        .toArray();

      samples.forEach((doc, idx) => {
        console.log(`\nDocument ${idx + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
      });
    }

    // Check for any documents missing appUserId
    const docsWithoutAppUserId = await subscriptionModel.countDocuments({
      appUserId: { $exists: false },
    });
    if (docsWithoutAppUserId > 0) {
      console.log(
        `\n⚠️  Warning: ${docsWithoutAppUserId} documents are missing appUserId field`,
      );
      const samples = await collection
        .find({ appUserId: { $exists: false } })
        .limit(5)
        .toArray();
      console.log('Sample documents missing appUserId:');
      samples.forEach((doc, idx) => {
        console.log(`\n${idx + 1}:`, JSON.stringify(doc, null, 2));
      });
    }
  } catch (error) {
    console.error('Check failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the check
checkData()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
