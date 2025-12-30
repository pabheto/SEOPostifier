/**
 * Backfill script: assigns an app-level user ID (appUserId) to users that
 * don't have one yet, and rewrites related references in licenses, sessions,
 * and subscriptions to use that appUserId.
 *
 * Usage:
 *   ts-node src/scripts/backfill-app-user-ids.ts
 *
 * Optional env:
 *   MONGODB_URI (defaults to mongodb://localhost:27028/seo_postifier)
 */

import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import { connect, model } from 'mongoose';

import {
  SubscriptionSchema,
  UserSubscription,
} from 'src/modules/subscriptions/schemas/subscription.schema';
import {
  License,
  LicenseSchema,
  Session,
  SessionSchema,
  User,
  UserSchema,
} from 'src/modules/users';

// Load environment variables
dotenv.config();

async function backfillAppUserIds() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27028/seo_postifier';

  await connect(mongoUri);
  console.log(`Connected to MongoDB at ${mongoUri}`);

  const UserModel = model<User>('User', UserSchema);
  const LicenseModel = model<License>('License', LicenseSchema);
  const SessionModel = model<Session>('Session', SessionSchema);
  const SubscriptionModel = model<UserSubscription>(
    'UserSubscription',
    SubscriptionSchema,
  );

  const usersToUpdate = await UserModel.find({
    $or: [
      { appUserId: { $exists: false } },
      { appUserId: null },
      { appUserId: '' },
    ],
  });

  console.log(`Found ${usersToUpdate.length} users missing appUserId`);

  for (const user of usersToUpdate) {
    const appUserId = randomUUID();
    const legacyId = user._id;
    const legacyIdStr = legacyId.toString();

    user.appUserId = appUserId;
    await user.save();

    const licenseResult = await LicenseModel.updateMany(
      { userId: { $in: [legacyId, legacyIdStr] } },
      { $set: { userId: appUserId } },
    );

    const sessionResult = await SessionModel.updateMany(
      { userId: { $in: [legacyId, legacyIdStr] } },
      { $set: { userId: appUserId } },
    );

    const subscriptionResult = await SubscriptionModel.updateMany(
      { userId: { $in: [legacyId, legacyIdStr] } },
      { $set: { userId: appUserId } },
    );

    console.log(
      `Updated user ${legacyIdStr} -> appUserId=${appUserId} | licenses:${licenseResult.modifiedCount} sessions:${sessionResult.modifiedCount} subscriptions:${subscriptionResult.modifiedCount}`,
    );
  }

  console.log('Backfill completed');
  process.exit(0);
}

backfillAppUserIds().catch((err) => {
  console.error('Fatal error during backfill:', err);
  process.exit(1);
});
