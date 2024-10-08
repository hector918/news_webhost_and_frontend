import srv from './fetch_.js';
const htmlKeyPrefix = "object_";
const handleError = (error) => {
  console.error(error);
}
//////////////////////////////////////

class IndexedDBWrapper {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async openDB(version = 1) {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(this.dbName, version);

      request.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(`数据库打开失败: ${event.target.errorCode}`);
      };
    });
  }

  async putData(key, value) {
    return new Promise((resolve, reject) => {
      try {
        let transaction = this.db.transaction([this.storeName], 'readwrite');
        let objectStore = transaction.objectStore(this.storeName);
        let request = undefined;
        if (typeof value === "string") {
          request = objectStore.put(JSON.parse(value), key);
        } else {
          request = objectStore.put(value, key);
        }
        request.onsuccess = () => {
          resolve('数据添加或更新成功');
        };
        request.onerror = (event) => {
          reject(`数据添加或更新失败: ${event.target.errorCode}`);
        };
      } catch (error) {
        srv.error_handle(error);
      }
    });
  }
  getDataWithCallback(key, callback) {
    console.log("on call get data")
    let transaction = this.db.transaction([this.storeName], 'readonly');
    let objectStore = transaction.objectStore(this.storeName);
    let request = objectStore.get(key);

    request.onsuccess = () => {
      console.log(request.result, key)
      if (request.result === undefined) {

        this.deleteData(key);
        callback(null);
      } else {
        callback(request.result);
      }
    };

    request.onerror = (event) => {
      console.log(`Data fetch failed: ${event.target.errorCode}`)
      callback(false);
    };
  }

  async getData(key) {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([this.storeName], 'readonly');
      let objectStore = transaction.objectStore(this.storeName);
      try {
        let request = objectStore.get(key);
        request.onsuccess = () => {
          if (request.result === undefined) {
            this.deleteData(key);
            resolve(false);
          } else {
            resolve(request.result);
          }
        };

        request.onerror = (event) => {
          reject(`数据获取失败: ${event.target.errorCode}`);
        };
      } catch (error) {
        resolve(false);
      }

    });
  }

  async deleteData(key) {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([this.storeName], 'readwrite');
      let objectStore = transaction.objectStore(this.storeName);
      let request = objectStore.delete(key);

      request.onsuccess = () => {
        resolve('数据删除成功');
      };

      request.onerror = (event) => {
        reject(`数据删除失败: ${event.target.errorCode}`);
      };
    });
  }
}


const dbWrapper = new IndexedDBWrapper('html_object', 'objectStore');
try {
  await dbWrapper.openDB();
}
catch (error) {
  srv.error_handle(error);
}
//////////////////////////////////////
async function getHTMLByHashList(hashList, callback) {

  const hashListForRequest = [];
  const ret = {};
  for (let hash of hashList) {
    try {
      const temp = await dbWrapper.getData(hash);

      if (temp === false) {

        hashListForRequest.push(hash);
      } else {
        ret[hash] = temp;
      }
    } catch (error) {
      console.log(error)
      hashListForRequest.push(hash);
      continue;
    }
  }
  console.log(hashListForRequest.length)
  if (hashListForRequest.length > 0) {
    try {
      srv.getHTMLByHashList(hashListForRequest, res => {
        console.log(Object.keys(res['payload']).length)
        if (res['payload']) for (let hash in res['payload']) {
          dbWrapper.putData(hash, res['payload'][hash]);
          ret[hash] = res['payload'][hash];
        };
        if (res['error']) {
          srv.error_handle(res['error']);
          callback(false);
        };
        callback(ret);
      });
    } catch (error) {
      srv.error_handle(error);
      callback(false);
    }

  } else {
    callback(ret);
  }
}

async function getHTMLByHash(hash) {
  try {
    return await dbWrapper.getData(hash);
  } catch (error) {
    srv.error_handle(`local storage getHTMLByHash error hash: ${hash}`);
    return undefined;
  }
}

export default { getHTMLByHashList, getHTMLByHash, dbWrapper }