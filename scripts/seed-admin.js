import mongoose from 'mongoose';
import config from '../config/config.js';
import User from '../server/models/user.model.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env before seeding.');
  process.exit(1);
}
try {
  await mongoose.connect(config.mongoUri);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = ADMIN_NAME;
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    await existing.save();
    console.log(`Updated administrator account: ${email}`);
  } else {
    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: 'admin' });
    console.log(`Created administrator account: ${email}`);
  }
} catch (error) {
  console.error(`Administrator setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
