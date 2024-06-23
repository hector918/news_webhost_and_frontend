const cluster = require('cluster');
const os = require('os');
const https = require('https');
const fs = require('fs');
const app = require('./app');
const numCPUs = os.cpus().length;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {

  const options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  };

  https.createServer(options, app).listen(8443, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
