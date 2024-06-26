const cluster = require('cluster');
const os = require('os');
const https = require('https');
const fs = require('fs');
const app = require('./app');
require('dotenv').config();

const { masterProcessQueries } = require('./running-memory');

const numCPUs = os.cpus().length;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.on('message', (message_from_worker) => {
      if (typeof message_from_worker === 'object') {
        // Process the query and send a response back to the worker
        const result = masterProcessQueries(message_from_worker);

        worker.send({ type: 'responses', result });
      }
    });

  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {

  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3 | require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
    ciphers: [
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA',
      'ECDHE-RSA-AES128-SHA',
    ].join(':'),
    honorCipherOrder: true,
  };
  https.createServer(options, app).listen(process.env.WEB_PORT || 8443, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
