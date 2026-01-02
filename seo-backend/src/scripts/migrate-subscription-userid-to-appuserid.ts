import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { UserSubscription } from '../modules/subscriptions/schemas/subscription.schema';

/**
 * Migration script to rename userId field to appUserId in subscription documents
 *
 * This script:
 * 1. Finds all subscription documents with userId field
 * 2. Renames userId to appUserId
 * 3. Removes the old userId field
 *
 * Run with: npx ts-node src/scripts/migrate-subscription-userid-to-appuserid.ts
 */
async function migrateSubscriptions() {
  console.log('Starting subscription migration: userId -> appUserId');

  const app = await NestFactory.createApplicationContext(AppModule);
  const subscriptionModel = app.get<Model<UserSubscription>>(
    getModelToken(UserSubscription.name),
  );

  try {
    // Find all subscriptions that have userId field but not appUserId
    const subscriptionsToMigrate = await subscriptionModel
      .find({
        userId: { $exists: true },
        appUserId: { $exists: false },
      })
      .exec();

    console.log(
      `Found ${subscriptionsToMigrate.length} subscriptions to migrate`,
    );

    if (subscriptionsToMigrate.length === 0) {
      console.log('No subscriptions need migration. Exiting.');
      await app.close();
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Migrate each subscription
    for (const subscription of subscriptionsToMigrate) {
      try {
        const oldUserId = (subscription as any).userId;

        if (!oldUserId) {
          console.log(
            `Skipping subscription ${subscription._id} - no userId found`,
          );
          continue;
        }

        // Update the document to use appUserId instead of userId
        await subscriptionModel.updateOne(
          { _id: subscription._id },
          {
            $set: { appUserId: oldUserId },
            $unset: { userId: 1 },
          },
        );

        console.log(
          `✓ Migrated subscription ${subscription._id}: userId="${oldUserId}" -> appUserId="${oldUserId}"`,
        );
        successCount++;
      } catch (error) {
        console.error(
          `✗ Error migrating subscription ${subscription._id}:`,
          error.message,
        );
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(
      `Total subscriptions processed: ${subscriptionsToMigrate.length}`,
    );
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    // Verify migration
    const remainingOldFormat = await subscriptionModel.countDocuments({
      userId: { $exists: true },
    });
    const newFormatCount = await subscriptionModel.countDocuments({
      appUserId: { $exists: true },
    });

    console.log('\n=== Post-Migration Status ===');
    console.log(`Subscriptions with old userId field: ${remainingOldFormat}`);
    console.log(`Subscriptions with new appUserId field: ${newFormatCount}`);

    if (remainingOldFormat > 0) {
      console.warn(
        '\n⚠️  Warning: Some subscriptions still have the old userId field.',
      );
    } else {
      console.log('\n✓ Migration completed successfully!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the migration
migrateSubscriptions()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
