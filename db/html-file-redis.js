const { createClient } = require('redis');

// Create a Redis client and specify the host and port
const html_redis = createClient({
  url: 'redis://192.168.3.20:6379',
  database: 5  // Note: 'database' might be correct for specific versions; ensure this is correct
});

// Event listener for successful connection
html_redis.on('connect', () => {
  console.log('Connected to html_redis');
});

// Event listener for connection errors
html_redis.on('error', (err) => {
  console.error('html_redis error:', err);
});

html_redis.set_with_expire = async (key, value) => {
  // 计算两个月后的时间戳
  const now = Math.floor(Date.now() / 1000);
  const expireTime = now + 60 * 24 * 60 * 60;  // 60 天后的时间戳
  // html_redis.set(key, value);
  html_redis.setEx(key, expireTime, value);
}

(async () => {
  try {
    await html_redis.connect();
    // Example operations
    // await html_redis.set('foo', 'bar');
    // const value = await html_redis.get('foo');
    // console.log(value);
  } catch (err) {
    console.error('Connection or operation error:', err);
  }
})();

// Close the connection gracefully
process.on('SIGINT', async () => {
  try {
    await html_redis.quit();
    console.log('Redis client disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error disconnecting Redis client:', err);
    process.exit(1);
  }
});

module.exports = { html_redis };
