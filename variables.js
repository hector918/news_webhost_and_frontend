///class////////////////////////////////
class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
    this.previous = null;
  }
}

class LinkedListQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  enqueueFront(element) {
    const newNode = new Node(element);
    if (this.isEmpty()) {
      this.front = this.rear = newNode;
    } else {
      newNode.next = this.front;
      this.front.previous = newNode;
      this.front = newNode;
    }
    this.size++;
  }

  dequeueRear() {
    if (this.isEmpty()) return null;

    const removedElement = this.rear.element;
    if (this.front === this.rear) {
      this.front = this.rear = null;
    } else {
      this.rear = this.rear.previous;
      if (this.rear) {
        this.rear.next = null;
      } else {
        this.front = null;
      }
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
    return this.isEmpty() ? null : this.front.element;
  }

  rearElement() {
    return this.isEmpty() ? null : this.rear.element;
  }
}

class AsyncCache {
  constructor(maxSize = 10_000_000) {
    this.cache = new Map();
    this.timestamps = new LinkedListQueue();
    this.lock = new Map();
    this.maxAge = 1000 * 60 * 60 * 24 * 60; // 2 months in milliseconds
    this.maxSize = maxSize;
  }

  async set(key, value) {
    let resolveLock;
    const lockPromise = new Promise(resolve => resolveLock = resolve);
    this.lock.set(key, lockPromise);

    try {
      const previousLock = this.lock.get(key) || Promise.resolve();
      await previousLock;

      const now = Date.now();
      this.cache.set(key, value);
      this.timestamps.enqueueFront({ key, timestamp: now });

      if (this.cache.size > this.maxSize) {
        const oldestEntry = this.timestamps.dequeueRear();
        if (oldestEntry) {
          this.cache.delete(oldestEntry.key);
        }
      }

      await this.cleanUp();
    } finally {
      resolveLock();
      this.lock.delete(key);
    }
  }

  async get(key) {
    await (this.lock.get(key) || Promise.resolve());
    return this.cache.get(key);
  }

  async delete(key) {
    let resolveLock;
    const lockPromise = new Promise(resolve => resolveLock = resolve);
    this.lock.set(key, lockPromise);

    try {
      const previousLock = this.lock.get(key) || Promise.resolve();
      await previousLock;

      this.cache.delete(key);
      await this.cleanUp();
    } finally {
      resolveLock();
      this.lock.delete(key);
    }
  }

  async hasKey(key) {
    await (this.lock.get(key) || Promise.resolve());
    return this.cache.has(key);
  }

  getSize() {
    return this.cache.size;
  }
  async cleanUp() {
    const now = Date.now();
    while (!this.timestamps.isEmpty()) {
      const { key, timestamp } = this.timestamps.rearElement();
      if (now - timestamp > this.maxAge) {
        this.timestamps.dequeueRear();
        this.cache.delete(key);
      } else {
        break;
      }
    }
  }

}

// 主函数，用于同时执行两个任务并合并结果
async function async_tasks(tasks) {

  try {
    // 使用 Promise.all() 同时执行多个异步任务
    const results = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const result = await task();
        return { [name]: result };
      })
    );

    // 合并结果为一个对象
    const combinedResults = results.reduce((acc, cur) => Object.assign(acc, cur), {});

    // 返回合并后的结果
    return combinedResults;
  } catch (error) {
    console.error('Error executing tasks:', error);
  }
}
async function async_wrapper(fn) {
  return new Promise((resolve) => {
    resolve(fn());
  });
}
////////////////////////////////////////////
const logDB_control_panel_code = new Map();

const memory_news_file_cache = new AsyncCache();
///////////////////////////////////////////
module.exports = {
  logDB_control_panel_code, memory_news_file_cache,
  async_tasks,
  async_wrapper

};
