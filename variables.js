const logDB_control_panel_code = {};

class AsyncCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map(); // Stores the insertion time for each key
    this.lock = new Map();
    this.maxAge = 1000 * 60 * 60 * 24 * 60; // 2 months in milliseconds
  }

  // Sets a key-value pair with a timestamp
  async set(key, value) {
    if (!this.lock.has(key)) {
      this.lock.set(key, new Promise(resolve => resolve()));
    }
    await this.lock.get(key);
    const now = Date.now();
    this.cache.set(key, value);
    this.timestamps.set(key, now);
    this.lock.delete(key);
    this.cleanUp(); // Clean up old entries after each set
  }

  // Gets the value associated with a key
  async get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return undefined;
  }

  // Deletes a key-value pair
  async delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    }
  }

  // Cleans up entries older than maxAge
  cleanUp() {
    const now = Date.now();
    for (let [key, timestamp] of this.timestamps) {
      if (now - timestamp > this.maxAge) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }
}
const memory_news_file_cache = new AsyncCache();

module.exports = { logDB_control_panel_code, memory_news_file_cache }