const WINDOW_MS = 5000;
const MAX_MESSAGES = 20;

export function createRateLimiter() {
  let timestamps = [];

  return function isAllowed() {
    const now = Date.now();
    timestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

    if (timestamps.length >= MAX_MESSAGES) return false;

    timestamps.push(now);
    return true;
  };
}