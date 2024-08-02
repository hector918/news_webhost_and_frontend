require('dotenv').config();
const http = require('http');
const https = require('https');
const { URL } = require('url');

const { logging } = require('../db/logging');
const { html_redis } = require('../db/html-file-redis');
const { save_to_news_cluster } = require('../queries/news-cluster');
const embedding_host_address = process.env.EMBEDDING_HOST_ADDRESS;
/////////////////////////////////////////
async function get_news_html_by_hash_list(hash_list) {
  // Check if hash_list is an array
  if (!Array.isArray(hash_list)) return false;

  const hash_for_files = [];
  const result_from_mem = {};

  for (const hash of hash_list) {
    if (!(await html_redis.exists(hash))) {
      hash_for_files.push(hash);
    } else {
      result_from_mem[hash] = await html_redis.get(hash);
    }
  }

  try {
    const records_from_embedding_host = await get_news_html_from_smb_host_by_hash_list(hash_for_files);

    if (records_from_embedding_host !== false) {
      for (const hash in records_from_embedding_host) {
        result_from_mem[hash] = records_from_embedding_host[hash];
        html_redis.set_with_expire(hash, JSON.stringify(records_from_embedding_host[hash]));
      }
    }

  } catch (error) {
    console.error("Error fetching records from embedding host:", error);
  }

  return result_from_mem;
}

async function generate_cluster_of_news() {
  try {
    const start_time = new Date().getTime();

    const kmean_centroid = await get_kmean();
    if (!Array.isArray(kmean_centroid)) throw `kmean_centroid error: ${kmean_centroid}`;

    const knn_result = await get_knn_by_hashs(kmean_centroid);
    if (knn_result === false) throw `get_knn_by_hashs error: ${knn_result}`;

    const hash_for_files = [];
    //send request if not found in memeory cache

    for (let hash of kmean_centroid) {
      if (!(await html_redis.exists(hash))) hash_for_files.push(hash);
    }
    for (let key in knn_result) {
      for (const [similarity, hash] of knn_result[key]) {
        //chech file existed in mem
        if (!(await html_redis.exists(hash))) hash_for_files.push(hash);
      }
    }
    //send request to get news html file, and put it back to the cache
    if (hash_for_files.length > 0) {
      const records = await get_news_html_from_smb_host_by_hash_list(hash_for_files);
      if (records === false) throw `get_news_html_from_smb_host_by_hash_list error: ${hash_for_files}`;
      for (let key in records) {
        html_redis.set_with_expire(key, JSON.stringify(records[key]));
      }
    }

    if (Array.isArray(kmean_centroid) && (typeof knn_result === "object")) {
      ret = save_to_news_cluster({ cluster: kmean_centroid, related_neighbors: knn_result });

      logging.info(`generate_cluster_of_news run time: ${((new Date().getTime() - start_time) / 1000).toFixed(2)} seconds`);

    } else {
      throw `generate_cluster_of_news kmean is array: ${Array.isArray(kmean_centroid)}, knn_result is ${knn_result.toString()}`;
    }
  } catch (error) {
    logging.error(error);
  }
}
//
async function get_kmean() {
  try {

    const default_options = { start_date: 'value1', end_date: 'value2' };

    const responseData = await sendPostRequest(`${embedding_host_address}/v1/embedding/kmean_by_period`, {}, {}, 80000);
    return responseData;
  } catch (error) {
    logging.error(`get_kmean ${embedding_host_address} error: ${error}`);
    return false;
  }

}

async function get_knn_by_hashs(hash_list) {
  try {
    const default_options = { start_date: 'value1', end_date: 'value2' };

    const responseData = await sendPostRequest(`${embedding_host_address}/v1/embedding/knn_by_hash`, { hash_list }, {}, 10000);
    return responseData;
  } catch (error) {
    logging.error(`get_knn_by_hashs ${embedding_host_address} error: ${error}`);
    return false;
  }
}

async function get_news_html_from_smb_host_by_hash_list(hash_list) {

  try {

    const responseData = await sendPostRequest(`${embedding_host_address}/v1/file/get_news_by_hash`, { hash_list }, {}, 8000);
    return responseData;
  } catch (error) {
    logging.error(`get_news_html_from_smb_host_by_hash_list ${embedding_host_address} error: ${error}`);
    return false;
  }
}

///////////////////////////////////////
async function sendPostRequest(url, data, headers = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol;
      const isHttps = protocol === 'https:';
      const port = parsedUrl.port || (isHttps ? 443 : 80);
      const hostname = parsedUrl.hostname;
      const path = parsedUrl.pathname + (parsedUrl.search || '');
      const postData = JSON.stringify(data);

      const options = {
        hostname: hostname,
        port: port,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        },
        timeout: timeout
      };

      const requestModule = isHttps ? https : http;

      const req = requestModule.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(responseData);
              resolve(jsonData);
            } catch (error) {
              reject(`Error parsing response data: ${error.message}`);
            }
          } else {
            reject(`Request failed, status code: ${res.statusCode}\nResponse data: ${responseData}`);
          }
        });
      });

      req.on('error', (error) => {
        reject(`Request error: ${error.message}`);
      });

      req.on('timeout', () => {
        req.abort();
        reject('Request timed out');
      });

      req.write(postData);
      req.end();
    } catch (error) {
      reject(`Invalid URL: ${error.message}`);
    }
  });
}

////////////////////
module.exports = { generate_cluster_of_news, get_news_html_by_hash_list }
