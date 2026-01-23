require('dotenv').config();
const { connectDb } = require('../config/db');
const ApRegion = require('../models/ApRegion');

const regions = [
  { title: { te: 'ఉత్తరాంధ్ర', en: 'North Andhra' }, order: 0 },
  { title: { te: 'ఉత్తర తీరాంధ్ర', en: 'North Coastal Andhra' }, order: 1 },
  { title: { te: 'మధ్య తీరాంధ్ర', en: 'Central Coastal Andhra' }, order: 2 },
  { title: { te: 'దక్షిణ తీరాంధ్ర', en: 'South Coastal Andhra' }, order: 3 },
  { title: { te: 'సీమాంధ్ర', en: 'Seema Andhra' }, order: 4 }
];

const run = async () => {
  await connectDb(process.env.MONGODB_URI);
  const existing = await ApRegion.find({});
  if (existing.length === 0) {
    await ApRegion.insertMany(regions);
    console.log('Seeded AP regions');
  } else {
    console.log('AP regions already exist');
  }
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
