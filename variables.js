const logDB_control_panel_code = {};

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class LinkedListQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  // Insert element at the front
  enqueueFront(element) {
    const newNode = new Node(element);
    if (this.isEmpty()) {
      this.front = this.rear = newNode;
    } else {
      newNode.next = this.front;
      this.front = newNode;
    }
    this.size++;
  }

  // Remove element from the rear
  dequeueRear() {
    if (this.isEmpty()) {
      return null;
    }

    let currentNode = this.front;
    let previousNode = null;

    while (currentNode.next) {
      previousNode = currentNode;
      currentNode = currentNode.next;
    }

    const removedElement = currentNode.element;
    if (previousNode) {
      previousNode.next = null;
      this.rear = previousNode;
    } else {
      this.front = this.rear = null;
    }

    this.size--;
    return removedElement;
  }

  isEmpty() {
    return this.size === 0;
  }

  getSize() {
    return this.size;
  }

  frontElement() {
    if (this.isEmpty()) {
      return null;
    }
    return this.front.element;
  }

  rearElement() {
    if (this.isEmpty()) {
      return null;
    }
    return this.rear.element;
  }
}

class AsyncCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new LinkedListQueue();
    this.lock = new Map();
    this.maxAge = 1000 * 60 * 60 * 24 * 60; // 2 months in milliseconds
  }

  async set(key, value) {
    let resolveLock;
    const lockPromise = new Promise(resolve => resolveLock = resolve);
    this.lock.set(key, lockPromise);

    const previousLock = this.lock.get(key) || Promise.resolve();
    await previousLock;

    const now = Date.now();
    this.cache.set(key, value);
    this.timestamps.enqueueFront({ key, timestamp: now });

    resolveLock();
    this.lock.delete(key);
    this.cleanUp();
  }

  async get(key) {
    await (this.lock.get(key) || Promise.resolve());
    return this.cache.get(key);
  }

  async delete(key) {
    await (this.lock.get(key) || Promise.resolve());
    this.cache.delete(key);
    this.cleanUp();
  }

  cleanUp() {
    const now = Date.now();
    while (!this.timestamps.isEmpty()) {
      const { key, timestamp } = this.timestamps.rearElement();
      if (now - timestamp > this.maxAge) {
        this.timestamps.dequeueRear();
        this.cache.delete(key);
        this.lock.delete(key);
      } else {
        break;
      }
    }
  }
}

const memory_news_file_cache = new AsyncCache();

module.exports = { logDB_control_panel_code, memory_news_file_cache };
