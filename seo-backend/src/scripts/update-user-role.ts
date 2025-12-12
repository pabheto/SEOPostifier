/**
 * Script to update a user's role
 *
 * Usage:
 *   ts-node src/scripts/update-user-role.ts <user-email> <role>
 *
 * Example:
 *   ts-node src/scripts/update-user-role.ts admin@example.com ADMIN
 */

import { connect, model } from 'mongoose';
import { User, UserSchema } from 'src/modules/users';
import { UserRole } from '../modules/users/enums/role.enum';

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3] as UserRole;

  if (!email || !role) {
    console.error('Usage: ts-node update-user-role.ts <email> <role>');
    console.error('Roles: USER, ADMIN');
    process.exit(1);
  }

  if (role !== UserRole.USER && role !== UserRole.ADMIN) {
    console.error('Invalid role. Must be USER or ADMIN');
    process.exit(1);
  }

  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27028/seo_postifier';

  try {
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    const UserModel = model<User>('User', UserSchema);
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Current role: ${user.role || 'NOT SET'}`);

    user.role = role;
    await user.save();

    console.log(`✅ Successfully updated user ${email} to role: ${role}`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

updateUserRole().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
