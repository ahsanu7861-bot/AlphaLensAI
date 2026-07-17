// utils/cache.js

const cache = new Map();

/**
 * Save data to cache
 * @param {string} key
 * @param {any} data
 * @param {number} ttlMinutes
 */
function setCache(key, data, ttlMinutes = 30) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  cache.set(key, {
    data,
    expiresAt
  });
}

/**
 * Get data from cache
 * @param {string} key
 * @returns {any|null}
 */
function getCache(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  // Expired?
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

/**
 * Delete one cache item
 */
function clearCache(key) {
  cache.delete(key);
}

/**
 * Clear everything
 */
function clearAllCache() {
  cache.clear();
}

module.exports = {
  setCache,
  getCache,
  clearCache,
  clearAllCache
};