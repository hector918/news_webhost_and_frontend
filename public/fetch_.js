const API = window.location.origin;
const fetch_timeout_limit = 5000;
let default_fetch_options = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};
function error_handle(error) {
  console.error(error);
}
//attach with post
const attachment = {
  userActivity: []
}
///////////////////////////////////////////
function fetch_patch(url, fetchOptions, callback) {
  fetch_post(url, fetchOptions, callback, 'PATCH');
}
function fetch_put(url, fetchOptions, callback) {
  fetch_post(url, fetchOptions, callback, 'PUT');
}
function fetch_post(url, fetchOptions, callback, method = 'POST') {
  fetchOptions.method = method;
  const copyAttachment = {};
  for (let key in attachment) {
    if (Array.isArray(attachment[key])) {
      copyAttachment[key] = [];
      while (attachment[key].length > 0) {
        copyAttachment[key].push(attachment[key].pop());
      }
      fetchOptions.body[key] = copyAttachment[key];
    }
  }

  fetchOptions.body = JSON.stringify(fetchOptions.body);
  fetchOptions.headers = {
    ...default_fetch_options,
    ...fetchOptions.headers,
  };
  if (fetchOptions.headers['Content-Type'] === "delete")
    delete fetchOptions.headers['Content-Type'];
  //add cookies before fire
  fetchOptions.credentials = "include";
  fetch(url, fetchOptions)
    .then(async (response) => [await response.json(), response.status])
    .then(([data, statusCode]) => {
      callback(data, statusCode);
    })
    .catch(error => {
      error_handle(error);
      for (let key in copyAttachment) {
        if (Array.isArray(copyAttachment[key])) {
          while (attachment[key].length > 0) {
            attachment[key].push(copyAttachment[key].pop());
          }
        }
      }
      callback(error);
    });
}
async function fetch_post_async(url, body) {
  try {
    body.method = "POST";
    body.headers = {
      ...body.headers,
      ...default_fetch_options,
    }
    //add cookies when fired
    body.credentials = "include";
    const res = await fetch(url, body);
    return res;
  } catch (error) {
    error_handle(error);
    return false;
  }
}
async function fetch_get_async(url) {
  try {
    body.method = "GET";
    body.headers = {
      ...default_fetch_options,
      signal: AbortSignal.timeout(fetch_timeout_limit)

    }
    //add cookies when fired
    body.credentials = "include";
    const res = await fetch(url);
    return res;
  } catch (error) {
    error_handle(error);
    return false;
  }
}
function fetch_get(url, callback) {
  const body = {
    method: "GET",
    headers: {
      ...default_fetch_options,
    },
    credentials: "include",
    signal: AbortSignal.timeout(fetch_timeout_limit)
  }

  fetch(url, body)
    .then(async (response) => [await response.json(), response.status])
    .then(([data, statusCode]) => {
      callback(data, statusCode);
    })
    .catch(error => {
      error_handle(error);
      callback({ error: "fetch error" });
    });
}
function fetch_delete(url, callback) {

  const body = {
    method: "DELETE",
    headers: {
      ...default_fetch_options,
    },
    credentials: "include",
  }

  fetch(url, body)
    .then((response) => response.json())
    .then((data) => {
      callback(data);
    })
    .catch(error => {
      error_handle(error);
      callback({ error: "fetch error" });
    });
}

////entry////////////////////////////////////////
function loadLanguage(language, callback) {
  fetch_get(`${API}/languages/${language}.json`, callback);
}

function testPost(body, callback) {
  fetch_post(`${API}/v1/testing`, { body }, callback);
}

function pageUnloadEvent(body, callback) {
  fetch_post(`${API}/v1/testing`, { body }, callback);
}

function readLatestCluster(callback) {
  fetch_get(`${API}/v1/news/lastest`, callback);
}

function getHTMLByHashList(hashList, callback) {
  fetch_post(`${API}/v1/news/read_news_by_hash_list`, {
    body: {
      hash_list: hashList
    }
  }, callback);
}

//export////////////////
export default { attachment, loadLanguage, pageUnloadEvent, readLatestCluster, getHTMLByHashList, testPost, error_handle }