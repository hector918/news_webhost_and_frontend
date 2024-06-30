const compoent_name_prefix = "compoent_name_";
//////////////////////////////////////////////////////
class elementRootH {
  elementList = {}
  routes = {}
  constructor() {

  }
  setRoute(path, document) {
    const queryStrings = parseHash(path);
    const temp = {};
    let currentPath = temp;
    for (let idx = 0; idx < queryStrings.length; idx++) {
      const itm = queryStrings[idx];

      const { path, params } = parseNestedQueryString(itm);
      if (path === "_") throw new Error("path '_' not allow.");
      currentPath[path] = {
        "_": {
          params,
          next: {}
        }
      };

      if (idx === queryStrings.length - 2) {
        currentPath[path]["_"]['function'] = document;
      }
      currentPath = currentPath[path];
    }
    this.routes = { ...this.routes, ...temp };
  }
  goRoute(path) {
    const queryStrings = parseHash(path);
    const fullRoute = {};
    let currentPath = this.routes;
    for (let idx = 0; idx < queryStrings.length; idx++) {
      const itm = queryStrings[idx];
      const { path, params } = parseNestedQueryString(itm);

      currentPath = currentPath[path];
      if (currentPath['_']['function']) currentPath['_']['function']();

    }

  }
  add(name, ele) {
    if (!this.has(name)) this.elementList[name] = ele;
  }
  del(name) {
    if (this.has(name)) {
      const deleteList = this.elementList[name].DOM.querySelectorAll(compoent_name_prefix);
      for (let el of deleteList) {
        const eleName = el.getAttribute(compoent_name_prefix);
        if (this.has(eleName)) {
          this.has(eleName).destory();
          delete this.elementList[eleName];
        }
      }
      delete this.elementList[name];
    }
  }
  get(name) {
    if (this.has(name)) {
      return this.elementList[name];
    } else {
      return undefined;
    }
  }
  has(name) {
    return this.elementList[name] !== undefined;
  }
}
const elementRoot = new elementRootH();

//////////////////////////////
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

  // 向队列添加元素
  enqueue(element) {
    const newNode = new Node(element);
    if (this.rear) {
      this.rear.next = newNode;
    }
    this.rear = newNode;
    if (!this.front) {
      this.front = newNode;
    }
    this.size++;
  }

  // 从队列移除元素
  dequeue() {
    if (this.isEmpty()) {
      return "Queue is empty";
    }
    const removedElement = this.front.element;
    this.front = this.front.next;
    if (!this.front) {
      this.rear = null;
    }
    this.size--;
    return removedElement;
  }

  // 查看队列头部元素
  frontElement() {
    if (this.isEmpty()) {
      return "Queue is empty";
    }
    return this.front.element;
  }

  // 检查队列是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 查看队列大小
  getSize() {
    return this.size;
  }

  // 清空队列
  clear() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }
}
//////////////////////////////////////////////////////
class varH {
  updateList = {}
  data = null

  constructor() {

  }

  get() {
    return this.data;
  }

  set(data) {
    const previousData = this.data;
    this.data = data;

    //update compoents
    for (let key in this.updateList) {
      const { component, renderHandle } = this.updateList[key];

      if (component && component.renders && component.renders[renderHandle] !== undefined) {
        component.renders[renderHandle](data);
      } else {
        delete this.updateList[key];
      }
    }
    return previousData;
  }
  onChangeCall({ component, renderHandle }) {
    this.updateList[Object.values(this.updateList).length] = { component, renderHandle };
  }
}
//////////////////////////////////////////////////////
class baseH {
  elements = {}
  renders = {}

  constructor({ name, structure, parent, render }) {
    if (elementRoot.has(name)) throw "component name already existed.";
    elementRoot.add(name, this);
    this.name = name;
    this.parent = parent;
    this.processStructure(structure);

    for (let itm in render) {
      this.renders[itm] = render[itm].bind(this);
    }

  }

  render(obj) {
    for (let itm in obj) {
      if (this.renders[itm]) this.renders[itm](obj[itm]);
    }
  }

  processStructure(structure) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(structure, "text/html");
    this.DOM = dom.body.firstElementChild;
    const elements = dom.querySelectorAll('[id_]');
    this.parent.append(this.DOM);
    this.DOM.setAttribute(compoent_name_prefix, this.name);
    for (let el of elements) {
      this.elements[el.getAttribute("id_")] = el;
    }
  }

  destory() {
    for (let itm in this.renders) this.renders[itm] = null;

    const descendants = document.querySelectorAll(`[${compoent_name_prefix}]`);
    for (let el of descendants) {
      // elementRoot[el.getAttribute(compoent_name_prefix)].destory();
    }
    this.renders = null;
    this.DOM.remove();
  }
}

//通用函数//////////////////////////////////////////////////
// function parseURL(url) {
//   const result = {};

//   try {
//     const urlObj = new URL(url);
//     result.protocol = urlObj.protocol;
//     result.hostname = urlObj.hostname;
//     result.port = urlObj.port;
//     result.pathname = urlObj.pathname;
//     result.search = urlObj.search;
//     result.hash = parseHash(urlObj.hash);
//     result.username = urlObj.username;
//     result.password = urlObj.password;
//     result.origin = urlObj.origin;
//     result.host = urlObj.host;
//   } catch (error) {
//     throw new Error('Invalid URL');
//   }

//   return result;
// }
function parseNestedQueryString(queryString) {
  if (!queryString) return null;
  const queryParamsIndex = queryString.indexOf("?");
  if (queryParamsIndex !== -1) {
    const ret = { path: queryString.slice(0, queryParamsIndex), params: {} };

    const params = queryString.slice(queryParamsIndex + 1);
    for (let param of params.split("&")) {
      const [key, value] = param.split("=");
      ret.params[key] = value;
    }
    return ret;
  } else {
    return { path: queryString };
  }
}

function parseHash(hash) {
  if (!hash) return null;
  // 去掉前面的/，然后按/分割
  const hashLevels = hash.slice(1).split('/');
  return hashLevels;
}
function getAncestors(element, attribute = compoent_name_prefix) {
  let ancestors = [];
  while (element) {
    ancestors.push(element);
    if (element.getAttribute(attribute) !== undefined) {
      break;
    }
    element = element.parentElement;
  }
  return ancestors;
}
function getDescendants(element, conditionFn) {
  let descendants = [];

  function traverse(node) {
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
      if (typeof conditionFn === "function") {
        if (conditionFn(children[i])) {
          descendants.push(children[i]);
        }
      }
      traverse(children[i]);
    }
  }

  traverse(element);
  return descendants;
}
//动态加载css
async function loadStyles(stylesheets, parent = document.head) {
  if (parent === undefined) return false;
  let arr = await Promise.all(stylesheets.map(url => fetch(url)));
  arr = await Promise.all(arr.map(url => url.text()));
  const style = document.createElement('style');
  style.textContent = arr.reduce(
    (prev, fileContents) => prev + fileContents, ''
  )
  parent.appendChild(style);
}
//
function throttle(fn, wait) {
  let lastCall = Date.now() - wait;
  return function () {
    let now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, arguments);
    }
  };
}

/////非阻塞渲染间任务
function _runTask(task, callback) {
  let start = Date.now();
  requestAnimationFrame(() => {
    if (Date.now() - start < 16.6) {
      task();
      callback();
    } else {
      _runTask(task, callback);
    }
  })
}
//////////测试是否touchable device
window.onload = function () {
  const infoDiv = document.getElementById('body');
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }
  if (isTouchDevice()) {
    console.log("This device is touch-enabled.");
  } else {
    console.log("This device is using a mouse or other non-touch input.");
  }
};
var isMobile = /iPhone|iPod|iPad|Android|BlackBerry/.test(navigator.userAgent);
function vibrate() {
  if (isMobile) {
    navigator.vibrate(50);
  }
}
//////////

export default { baseH, varH, LinkedListQueue, elementRoot, throttle }