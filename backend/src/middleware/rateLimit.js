const buckets = new Map();

const cleanupBuckets = () => {
  const now = Date.now();
  for (const [key, value] of buckets.entries()) {
    if (value.expiresAt <= now) {
      buckets.delete(key);
    }
  }
};

setInterval(cleanupBuckets, 60_000).unref();

const rateLimit = ({ windowMs = 60_000, max = 120 } = {}) => (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }
  if (current.count >= max) {
    return res.status(429).json({ message: 'Too many requests' });
  }
  current.count += 1;
  buckets.set(key, current);
  return next();
};

module.exports = { rateLimit };
