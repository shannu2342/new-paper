const webpush = require('web-push');
const PushSubscriber = require('../models/PushSubscriber');

const hasVapid = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);

if (hasVapid) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}

const getPublicKey = (req, res) => {
  if (!hasVapid) {
    return res.json({ enabled: false, publicKey: null });
  }
  return res.json({ enabled: true, publicKey: process.env.VAPID_PUBLIC_KEY });
};

const subscribe = async (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Invalid subscription payload' });
  }
  await PushSubscriber.findOneAndUpdate(
    { endpoint },
    { endpoint, keys },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json({ message: 'Subscribed' });
};

const broadcast = async (req, res) => {
  if (!hasVapid) {
    return res.status(400).json({ message: 'Push not configured on server' });
  }
  const title = req.body?.title || 'Breaking News';
  const body = req.body?.body || 'New update available.';
  const url = req.body?.url || '/';

  const subs = await PushSubscriber.find().lean();
  const payload = JSON.stringify({ title, body, url });
  const results = await Promise.allSettled(subs.map((sub) => webpush.sendNotification(sub, payload)));

  const expired = results
    .map((item, index) => ({ item, endpoint: subs[index]?.endpoint }))
    .filter(({ item }) => item.status === 'rejected' && [404, 410].includes(item.reason?.statusCode))
    .map(({ endpoint }) => endpoint)
    .filter(Boolean);

  if (expired.length) {
    await PushSubscriber.deleteMany({ endpoint: { $in: expired } });
  }

  const sent = results.filter((item) => item.status === 'fulfilled').length;
  return res.json({ sent, total: subs.length });
};

module.exports = { getPublicKey, subscribe, broadcast };
