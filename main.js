const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const https = require('https');
const app = require('./app');
require('dotenv').config();

const { masterProcessQueries } = require('./running-memory');

if (isMainThread) {
  console.log(`Master ${process.pid} is running`);

  const numCPUs = os.cpus().length;

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = new Worker(__filename, {
      workerData: { id: i }  // You can pass any data to the worker
    });

    worker.on('message', (message_from_worker) => {
      if (typeof message_from_worker === 'object') {
        // Process the query and send a response back to the worker
        const result = masterProcessQueries(message_from_worker);

        worker.postMessage({ type: 'responses', result });
      }
    });

    worker.on('exit', (code) => {
      console.log(`Worker ${worker.threadId} died with exit code ${code}`);
      // Optionally restart a new worker
      new Worker(__filename, { workerData: { id: i } });
    });
  }

  // Asynchronous timed task
  require('./controllers/scheduled-tasks')();

} else {
  // This part is executed by workers
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

  https.createServer(options, app).listen(process.env.WEB_PORT || 8443, '0.0.0.0', () => {
    console.log(`Worker ${process.pid} started on port: ${process.env.WEB_PORT || 8443}`);
  });

  parentPort.on('message', (message_from_master) => {
    console.log('Received message from master:', message_from_master);

    if (message_from_master.type === 'query') {
      // Handle the query
      const query = message_from_master.query;
      parentPort.postMessage({ type: 'query', query });
    }
  });

  // Notify master process that this worker has started
  parentPort.postMessage({ type: 'status', message: `Worker ${process.pid} started` });
}
