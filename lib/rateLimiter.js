/**
 * Simple in-memory per-key rate limiter (sliding window).
 * Resets on process restart and isn't shared across multiple instances —
 * fine for a single small Node process; swap for a real store (Redis) if
 * this ever runs behind a load balancer / multiple app instances.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });
 *   if (limiter.isLimited(req.ip)) { ... }
 */
function createRateLimiter({ windowMs, max }) {
  const hitsByKey = new Map();

  function isLimited(key) {
    const now = Date.now();
    const hits = (hitsByKey.get(key) || []).filter((t) => now - t < windowMs);
    hits.push(now);
    hitsByKey.set(key, hits);
    return hits.length > max;
  }

  return { isLimited };
}

module.exports = { createRateLimiter };
