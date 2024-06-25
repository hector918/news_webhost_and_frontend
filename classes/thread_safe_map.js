
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

class ThreadSafeMap {
  constructor() {
    this.map = new Map();
    this.worker = new Worker(__filename);
    this.worker.on('message', (message) => {
      if (message.type === 'response') {
        this.resolve(message.data);
      }
    });
  }

  async set(key, value) {
    return this._sendToWorker({ type: 'set', key, value });
  }

  async delete(key) {
    return this._sendToWorker({ type: 'delete', key });
  }

  async has(key) {
    return this._sendToWorker({ type: 'has', key });
  }

  async get(key) {
    return this._sendToWorker({ type: 'get', key });
  }

  async entries() {
    return this._sendToWorker({ type: 'entries' });
  }

  async _sendToWorker(message) {
    this.worker.postMessage(message);
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
}

if (!isMainThread) {
  const map = new Map();

  parentPort.on('message', (message) => {
    let result;
    switch (message.type) {
      case 'set':
        map.set(message.key, message.value);
        parentPort.postMessage({ type: 'response', data: true });
        break;
      case 'delete':
        result = map.delete(message.key);
        parentPort.postMessage({ type: 'response', data: result });
        break;
      case 'has':
        result = map.has(message.key);
        parentPort.postMessage({ type: 'response', data: result });
        break;
      case 'get':
        result = map.get(message.key);
        parentPort.postMessage({ type: 'response', data: result });
        break;
      case 'entries':
        result = Array.from(map.entries());
        parentPort.postMessage({ type: 'response', data: result });
        break;
    }
  });
}

module.exports = ThreadSafeMap;
