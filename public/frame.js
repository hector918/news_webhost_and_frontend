const compoent_name_prefix = "compoent_name_";
const translate_component_key = "translation_";
const id_key = "id_";
//////////////////////////////////////////////////////
class UserEvent {
  constructor(type, category, action, label, value) {
    this.timestamp = new Date().toISOString();
    this.type = type;
    this.category = category;
    this.action = action;
    this.label = label;
    this.value = value;
    // this.sessionId = getSessionId(); // 实现这个函数来获取会话ID
    // this.userId = getUserId(); // 实现这个函数来获取用户ID
    this.pageUrl = window.location.href;
    this.userAgent = navigator.userAgent;
  }
}

class UserActivityTracker {
  constructor() {
    this.events = [];
    this.pageViewStartTime = new Date();
    this.currentPageUrl = window.location.href;
  }

  trackEvent(type, category, action, label = null, value = null) {
    const event = new UserEvent(type, category, action, label, value);
    this.events.push(event);
  }

  trackPageView() {
    // 如果这不是首次加载，先记录上一个页面的停留时间
    if (this.pageViewStartTime) {
      this.trackPageDuration();
    }

    // 记录新的页面访问
    this.pageViewStartTime = new Date();
    this.currentPageUrl = window.location.href;
    this.trackEvent('pageview', 'engagement', 'view', window.location.pathname);
  }

  trackPageDuration() {
    const endTime = new Date();
    const duration = (endTime - this.pageViewStartTime) / 1000; // 转换为秒
    this.trackEvent('pageduration', 'engagement', 'time_on_page', this.currentPageUrl, duration);
  }

  // sendEvents() {
  //   // 在发送事件之前，先记录当前页面的停留时间
  //   this.trackPageDuration();

  //   if (this.events.length === 0) return;

  //   fetch('/api/user-activities', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(this.events)
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('Events sent successfully:', data);
  //       this.events = []; // 清空已发送的事件
  //     })
  //     .catch(error => console.error('Error sending events:', error));
  // }
}

////////////////////////
class elementRootH {
  elementList = {}
  routes = {}
  currentRoute = "";
  constructor() {
    this.tracker = new UserActivityTracker()
    this.attachToPost = this.tracker.events;
  }

  setRoute(path, fn) {
    //从子路径中改变父路径的元素属性，必须由子元素调用父元素函数
    /* this.routes 的结构例子
    {
      "mainPanel": {
        "@": { "params": {},"next": {} },
        "game.index": {
          "@": { "params": {}, "next": {} }
        },
        "news.index": {
          "@": { "params": {}, "next": {} },
          "kkk": { "@": { "params": {}, "next": {} }
          }
        }
      }
    }
    */
    const route = {};
    let currentPath = route;
    const { subPaths, params } = this.url_hash_spliter(path);
    for (let pathStep of subPaths) {
      currentPath[pathStep] = {
        "@": {
          params,
          next: {}
        }
      }
      switch (pathStep) {
        case "@": {
          console.warn("path '@' not allow.");
          return;
        }
        case subPaths[subPaths.length - 1]: {
          //if reach last element 
          currentPath[pathStep]['@']['function'] = fn.bind(this);
          break;
        }
      }
      currentPath = currentPath[pathStep];
    }
    this.routes = deepMerge(this.routes, route);
  }
  goRoute(path) {
    this.releaseResource(path);
    if (path === this.currentRoute) return;
    this.currentRoute = path;
    let currentPath = this.routes;
    const { subPaths, params } = this.url_hash_spliter(path);
    for (let pathStep of subPaths) {
      if (currentPath[pathStep] === undefined) {
        console.error(`${path} not found.`);
      }
      checkAndRun(currentPath[pathStep], params);
      currentPath = currentPath[pathStep];
    }
    window.location.hash = `#${path}`;
    this.tracker.trackPageView();
    ///////////////////////////
    function checkAndRun(fn, param) {
      if (fn['@']['function']) if (typeof (fn['@']['function']) === "function") {
        return fn['@']['function'](param);
      }
      return false;
    }
  }
  releaseResource(newRoute) {
    ///////////////////////////
    const findDiffPath = (routeOne, routeTwo) => {
      const { subPaths: targetPath } = this.url_hash_spliter(routeOne);
      const { subPaths: currentPath } = this.url_hash_spliter(routeTwo);
      for (let idx = 0; idx < currentPath.length; idx++) {
        if (currentPath[idx] !== targetPath[idx]) return currentPath[idx];
      }
      return false;
    }
    ////////////////////////////////
    const diffPath = findDiffPath(newRoute, this.currentRoute);
    if (diffPath) this.del(diffPath);
  }
  add(name, ele) {
    if (!this.has(name)) this.elementList[name] = ele;
  }
  del(name) {

    if (this.has(name)) {
      const deleteList = this.elementList[name].DOM.querySelectorAll(`[${compoent_name_prefix}]`);
      for (let el of deleteList) {
        const eleName = el.getAttribute(compoent_name_prefix);
        if (this.has(eleName)) {
          this.elementList[eleName].destory();
          delete this.elementList[eleName];
        }
      }
      this.elementList[name].destory();
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

  url_hash_spliter(queryString) {
    if (!queryString) return { subPaths: {}, params: {} };
    const [path, params] = queryString.replace(/#/g, "").split("?");
    const paramsObj = {};
    if (Array.isArray(params)) for (let param of params.split("&")) {
      const [key, value] = param.split("=");
      paramsObj[key] = value;
    }
    const pathObj = [];
    for (let target of path.split("/")) {
      //如果target为空，为null, 或为false会跳过
      if (!target) continue;
      pathObj.push(target);
    }
    return { subPaths: pathObj, params: paramsObj }
  }
}
const elementRoot = new elementRootH();

//////////////////////////////////////////////////////
class variable {
  updateList = {}
  data = null

  constructor(defaultVal = undefined) {
    this.data = defaultVal;
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
  onChangeCall(component, renderHandle) {
    this.updateList[Object.values(this.updateList).length] = { component, renderHandle };
  }
}

//////Hector on Jun 1////////////////
class baseComponent {
  elements = {}
  renders = {}

  constructor({ name, structure, parent, render, events, variable, fromElementId }) {
    if (elementRoot.has(name)) {
      console.warn(`component name ${name} already existed.`);
      return elementRoot.get(name);
    }
    elementRoot.add(name, this);
    this.name = name;
    this.parent = parent;
    //html
    if (fromElementId !== undefined) {
      this.DOM = document.querySelector("#" + fromElementId)
    } else {
      this.processStructure(structure);
    }

    //variable
    for (let key in variable) {
      if (!Object.hasOwnProperty(key)) {
        this[key] = variable[key];
      }
    }
    //render
    for (let itm in render) {
      this.renders[itm] = render[itm].bind(this);
    }
    //event
    if (Array.isArray(events)) for (let { target, event, fn } of events) {

      if (this.elements[target] && typeof fn === "function") {
        this.elements[target].addEventListener(event, fn.bind(this));
      }
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
    const elements = dom.querySelectorAll(`[${id_key}]`);
    try {
      this.parent.append(this.DOM);
      this.DOM.setAttribute(compoent_name_prefix, this.name);
      for (let el of elements) {
        this.elements[el.getAttribute(`${id_key}`)] = el;
      }
    } catch (error) {
      console.error(error, `name = ${this.name}, parent = ${this.parent}`);
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
function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) {
    return source;
  }

  if (typeof source !== 'object' || source === null) {
    return target;
  }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) {
          target[key] = Array.isArray(source[key]) ? [] : {};
        }
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}

function handleSwipe({ touchstartX, touchstartY, touchendX, touchendY }, swipeArea) {
  if (!isTouchDevice()) return;
  const diffX = touchendX - touchstartX;
  const diffY = touchendY - touchstartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 0) {
      console.log('Swiped right');
      swipeArea.textContent = 'Swiped Right';
    } else {
      console.log('Swiped left');
      swipeArea.textContent = 'Swiped Left';
    }
  } else {
    // Vertical swipe
    if (diffY > 0) {
      console.log('Swiped down');
      swipeArea.textContent = 'Swiped Down';
    } else {
      console.log('Swiped up');
      swipeArea.textContent = 'Swiped Up';
    }
  }
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
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
//////////测试是否touchable device
window.onload = function () {
  const infoDiv = document.getElementById('body');

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

export default {
  baseComponent,
  variable,
  UserActivityTracker,
  id_key,
  throttle,
  handleSwipe,
  elementRoot,
  translate_component_key
}

///LinkedListQueue///////////////////////////
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
