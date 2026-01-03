import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { UserSubscription } from '../modules/subscriptions/schemas/subscription.schema';

/**
 * Script to drop the old userId_1 index from the usersubscriptions collection
 *
 * This index was created when the field was called userId, but after migration
 * to appUserId, the old index still exists and causes duplicate key errors
 * because multiple documents have userId: null
 *
 * Run with: npx ts-node src/scripts/drop-old-userid-index.ts
 */
async function dropOldIndex() {
  console.log('Starting index cleanup: dropping userId_1 index');

  const app = await NestFactory.createApplicationContext(AppModule);
  const subscriptionModel = app.get<Model<UserSubscription>>(
    getModelToken(UserSubscription.name),
  );

  try {
    // Get collection
    const collection = subscriptionModel.collection;

    // List current indexes
    console.log('\n=== Current Indexes ===');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if userId_1 index exists
    const hasOldIndex = indexes.some((index) => index.name === 'userId_1');

    if (!hasOldIndex) {
      console.log('\n✓ userId_1 index does not exist. Nothing to do.');
      await app.close();
      return;
    }

    console.log('\n⚠️  Found userId_1 index. Dropping it...');

    // Drop the old index
    await collection.dropIndex('userId_1');

    console.log('✓ Successfully dropped userId_1 index');

    // List indexes after dropping
    console.log('\n=== Indexes After Cleanup ===');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✓ Index cleanup completed successfully!');
  } catch (error) {
    console.error('Index cleanup failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the cleanup
dropOldIndex()
  .then(() => {
    console.log('Index cleanup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Index cleanup script failed:', error);
    process.exit(1);
  });

