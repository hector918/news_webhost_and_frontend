const { html_redis } = require('./db/html-file-redis');


(async () => {
  console.log(await html_redis.exists("foo"), await html_redis.exists("86d0b14f8b09ec11dbc8338d6c2226e4dcbad8ba65e18eafd4c78f02b0ae5b62"));

  if (await html_redis.exists("86d0b14f8b09ec11dbc8338d6c2226e4dcbad8ba65e18eafd4c78f02b0ae5b62")) {
    console.log(true);
  } else {
    console.log(false);
  }

  '86d0b14f8b09ec11dbc8338d6c2226e4dcbad8ba65e18eafd4c78f02b0ae5b62'
})()