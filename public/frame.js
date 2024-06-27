class varH {
  updateList = []
  constructor() {

  }
  get() {

  }
  set() {

  }
  onChangeCall(base) {

  }
}
class baseH {
  variable = {}
  elements = {}
  renders = {}
  constructor({ name, structure, parent, variable, render }) {
    this.name = name;
    this.parent = parent;
    this.processStructure(structure);

    for (let itm in variable) {
      this.variable[itm] = variable[itm];
    }
    for (let itm in render) {
      this.renders[itm] = render[itm].bind(this);
    }
    // parent.append(this.DOM)
  }
  render(obj) {
    for (let itm in obj) {
      this.variable[itm] = obj[itm];
      console.log(this.renders[itm])
      if (this.renders[itm]) this.renders[itm](obj[itm]);
    }
  }

  processStructure(structure) {
    const parser = new DOMParser();
    this.DOM = parser.parseFromString(structure, "text/html");
    const elements = this.DOM.querySelectorAll('[id_]');
    this.parent.append(this.DOM.body.firstElementChild);

    for (let el of elements) {
      this.elements[el.getAttribute("id_")] = el;
    }

  }
}

//通用函数
//动态加载css
async function loadStyles(stylesheets, parent = document.head) {
  if (parent === undefined) return false;
  let arr = await Promise.all(stylesheets.map(url => fetch(url)))
  arr = await Promise.all(arr.map(url => url.text()))
  const style = document.createElement('style')
  style.textContent = arr.reduce(
    (prev, fileContents) => prev + fileContents, ''
  )
  parent.appendChild(style);
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
function vibrate() {
  if (isMobile) {
    navigator.vibrate(50);
  }
}
//////////
const dateRoot = {};

dateRoot['test'] = new varH();



export default { baseH, varH, dateRoot }