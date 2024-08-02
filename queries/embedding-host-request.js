const http = require('http');
const https = require('https');
const { URL } = require('url');

const { logging } = require('../db/logging');
const { memory_news_file_cache, async_tasks, async_wrapper } = require('../variables');
const { save_to_news_cluster } = require('../queries/news-cluster');
/////////////////////////////////////////
async function get_news_html_by_hash_list(hash_list) {
  // Check if hash_list is an array
  if (!Array.isArray(hash_list)) return false;

  const hash_for_files = [];
  const result_from_mem = {};

  for (const hash of hash_list) {
    if (!memory_news_file_cache.hasKey(hash)) {
      hash_for_files.push(hash);
    } else {
      result_from_mem[hash] = memory_news_file_cache.get(hash);
    }
  }

  try {
    const records_from_embedding_host = await get_news_html_from_smb_host_by_hash_list(hash_for_files);

    if (records_from_embedding_host !== false) {
      for (const hash in records_from_embedding_host) {
        result_from_mem[hash] = records_from_embedding_host[hash];
        memory_news_file_cache.set(hash, records_from_embedding_host[hash]);
      }
    }

  } catch (error) {
    console.error("Error fetching records from embedding host:", error);
  }

  return result_from_mem;
}

async function generate_cluster_of_news() {
  const kmean_centroid = await get_kmean();
  if (!Array.isArray(kmean_centroid)) return false;

  const knn_result = await get_knn_by_hashs(kmean_centroid);
  if (knn_result === false) return false;

  const hash_for_files = [];
  //send request if not found in memeory cache
  for (let hash of kmean_centroid) {
    if (!memory_news_file_cache.hasKey(hash)) hash_for_files.push(hash);
  }
  for (let key in knn_result) {
    for (const [similarity, hash] of knn_result[key]) {
      //chech file existed in mem
      if (!memory_news_file_cache.hasKey(hash)) hash_for_files.push(hash);
    }
  }
  //send request to get news html file, and put it back to the cache
  if (hash_for_files.length > 0) {
    const records = await get_news_html_from_smb_host_by_hash_list(hash_for_files);
    if (records === false) return false;
    for (let key in records) {
      memory_news_file_cache.set(key, records[key]);
    }
  }

  if (Array.isArray(kmean_centroid) && (typeof knn_result === "object")) {
    ret = save_to_news_cluster({ cluster: kmean_centroid, related_neighbors: knn_result });
  } else {

    logging.error(`generate_cluster_of_news kmean is array: ${Array.isArray(kmean_centroid)}, knn_result is ${knn_result.toString()}`);
  }
}
//
async function get_kmean() {
  try {
    const url = logDB_control_panel_code['embedding_host_address']['text'] || undefined;
    if (url === undefined) return false;
    const default_options = { start_date: 'value1', end_date: 'value2' };

    const responseData = await sendPostRequest(`${url}/v1/embedding/kmean_by_period`, {}, {}, 80000);
    return responseData;
  } catch (error) {
    logging.error(`get_kmean ${url} error: ${error}`);
    return false;
  }

}

async function get_knn_by_hashs(hash_list) {
  try {

    const url = logDB_control_panel_code['embedding_host_address']['text'] || undefined;
    if (url === undefined) return false;
    const default_options = { start_date: 'value1', end_date: 'value2' };
    const responseData = await sendPostRequest(`${url}/v1/embedding/knn_by_hash`, { hash_list }, {}, 8000);
    return responseData;
  } catch (error) {
    logging.error(`get_knn_by_hashs ${url} error: ${error}`);
    return false;
  }
}

async function get_news_html_from_smb_host_by_hash_list(hash_list) {

  try {
    embedding_host_address = process.send({ 'get_control_panel': "embedding_host_address" });
    console.log(embedding_host_address);
    return;
    const url = logDB_control_panel_code['embedding_host_address']['text'] || undefined;
    if (url === undefined) return false;

    const responseData = await sendPostRequest(`${url}/v1/file/get_news_by_hash`, { hash_list }, {}, 8000);
    return responseData;
  } catch (error) {
    logging.error(`get_news_html_from_smb_host_by_hash_list ${url} error: ${error}`);
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
