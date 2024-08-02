const redis = require('redis');

// Create a Redis client and specify the host and port
const html_redis = redis.createClient({
  url: 'redis://192.168.3.20:6379',
  database: 5
});
// Event listener for successful connection
html_redis.on('connect', () => {
  console.log('Connected to html_redis');
});

// Event listener for connection errors
html_redis.on('error', (err) => {
  console.error('html_redis error:', err);
});
(async () => {
  await html_redis.connect();

  // await session_redis.set('foo', 'bar');
  // const value = await session_redis.get('foo');
  // console.log(value);
})()


module.exports = { html_redis }