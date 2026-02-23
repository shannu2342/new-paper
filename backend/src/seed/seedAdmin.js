require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDb } = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDb(process.env.MONGODB_URI);
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  const role = process.env.ADMIN_ROLE || 'super_admin';

  if (!username || !password) {
    console.error('Missing ADMIN_USER or ADMIN_PASS in environment');
    process.exit(1);
  }

  const existing = await User.findOne({ username });
  if (existing) {
    console.log('Admin already exists:', username);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, role });
  console.log('Seeded admin user:', username);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
