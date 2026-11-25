import mongoose from 'mongoose';
import config from './config/config.js';
import app from './server/express.js';
import User from './server/models/user.model.js';
try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await Promise.all(Object.values(mongoose.models).map(Model => Model.init()));
  console.log('Connected to MongoDB database: ' + mongoose.connection.name);
  if (process.env.SEED_ADMIN_ON_STARTUP === 'true') {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD to seed the administrator.');
    const email = ADMIN_EMAIL.trim().toLowerCase();
    if (!await User.exists({ email })) {
      await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: 'admin' });
      console.log('Created initial administrator account.');
    }
  }
  const server = app.listen(config.port, '0.0.0.0', () => console.log('Server running at http://localhost:' + config.port + '/'));
  server.on('error', async err => { console.error(err.message); await mongoose.disconnect(); process.exitCode = 1; });
  async function shutdown() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err) { console.error('Server startup failed: ' + err.message); process.exitCode = 1; }
