const redis = require('redis');

// Create a Redis client and specify the host and port
const session_redis = redis.createClient({
  url: 'redis://192.168.3.20:6379',
  database: 1
});
// Event listener for successful connection
session_redis.on('connect', () => {
  console.log('Connected to session_redis');
});

// Event listener for connection errors
session_redis.on('error', (err) => {
  console.error('session_redis error:', err);
});
(async () => {
  await session_redis.connect();

  // await session_redis.set('foo', 'bar');
  // const value = await session_redis.get('foo');
  // console.log(value);
})()


module.exports = { session_redis }