import frame from './frame.js';
import srv from './fetch_.js';
import ls from './localStorage.js'
const id = frame.id_key;
const elementRoot = frame.elementRoot;
srv.attachment.userActivity = elementRoot.attachToPost;

new frame.baseComponent({
  name: "root",
  structure: `
    <div class="is-flex root_ is-flex-grow-1" ${id}="root_div"></div>
  `,
  parent: document.querySelector("body"),
  render: {
    "changeLanguage": function (obj) {
      const nodeList = this.elements["root_div"].querySelectorAll(`[${frame.translate_component_key}]`);
      for (let node of nodeList) {
        const key = node.getAttribute(frame.translate_component_key);
        node.innerHTML = obj[key] || key;
      }
    }
  }
});
//0	1	1	2	3	5	8	13	21	34	55
new frame.baseComponent({
  name: "loading",
  fromElementId: "loading_div_h",
  parent: document.querySelector("body"),
});

//
new frame.baseComponent({
  name: "navbar",
  structure: `
    <nav class="navbar is-link navbar_ " role="navigation" aria-label="main navigation">
    <div class="navbar-brand is-flex-grow-1" style="overflow: hidden;">
      <a class="navbar-item" href="https://bulma.io">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 110L10 40L50 0L100 50L70 80L110 120L50 160L0 110Z" fill="#00D1B2"/>
      </svg>

      </a>
      <div class="navbar-item is-justify-content-space-around is-flex-grow-1">
        <a 
          class="navbar-item" 
          ${id}="button-1" 
          ${frame.translate_component_key}="news"
        >testing</a>
        <a 
          class="navbar-item" 
          ${id}="button-2"
          ${frame.translate_component_key}="profile"
        >testing</a>
        <a 
          class="navbar-item" 
          ${id}="button-3"${frame.translate_component_key}="testing"
        >testing</a>
        <a class="navbar-item" ${id}="button-4">testing</a>
        
      </div>
      
    </div>
  </nav>
  `,
  parent: elementRoot.get("root").elements['root_div'],
  render: {
    testing: function (str) {
      this.elements["button-1"].innerHTML = str;
    }
  },
  events: [
    {
      target: "button-1", event: "click", fn: (evt) => {
        elementRoot.goRoute("/mainPanel/game.index?variable='hello world&abcd=e231/kkk");
      }
    },
    {
      target: "button-2", event: "click", fn: (evt) => {
        elementRoot.goRoute("/mainPanel/news.index");
      }
    },
    {
      target: "button-3", event: "click", fn: (evt) => {
        srv.testPost({ testing: "hello world" }, (data, code) => {
          console.log(data, code);
        })
      }
    },
  ]
});


elementRoot.setRoute("/?testing=true", (params) => {
  new frame.baseComponent({
    name: "mainPanel",
    structure: `<div class="is-flex-grow-1" ${id}="main_panel">testing</div>`,
    parent: elementRoot.elementList["root"].elements["root_div"],
  });
});

elementRoot.setRoute("/mainPanel/game.index?variable='hello world&abcd=e231/kkk", (function (params) {
  new frame.baseComponent({
    name: "mainPanel",
    structure: `<div class="is-flex-grow-1" ${id}="main_panel">testing</div>`,
    parent: elementRoot.elementList["root"].elements["root_div"],
  });
  const gameIndex = new frame.baseComponent({
    name: "game.index",
    structure: `<div ${id}="game.index">game.index</div>`,
    parent: this.elementList["mainPanel"].elements['main_panel'],
  });
  const kkk = new frame.baseComponent({
    name: "kkk",
    structure: `<div ${id}="kkk" ${frame.translate_component_key}="testing">wohoo</div>`,
    parent: gameIndex.elements["game.index"],
  });
}));

elementRoot.setRoute("/mainPanel/news.index", (function (params) {

  new frame.baseComponent({
    name: "mainPanel",
    structure: `<div class="is-flex-grow-1" ${id}="main_panel"></div>`,
    parent: elementRoot.elementList["root"].elements["root_div"],
  });
  const newsIndex = new frame.baseComponent({
    name: "news.index",
    structure: `<div ${id}="news.index"></div>`,
    parent: this.elementList["mainPanel"].elements['main_panel'],

  });

  const matrixSize = 100;
  const matrix = Array.from({ length: matrixSize }, (_, i) =>
    Array.from({ length: matrixSize }, (_, j) => `Cell ${i + 1},${j + 1}`)
  );
  const swipePanel = new frame.swipingMatrix({
    parent: newsIndex.elements['news.index'],
    matrix
  })

}));

//init the app start with url
if (window.location.hash) {
  elementRoot.goRoute(window.location.hash);
} else elementRoot.goRoute("/");

const variablePool = {};
variablePool.user_info = new frame.variable("hello");
variablePool.user_info.onChangeCall(elementRoot.get("navbar"), "testing");

variablePool.languageSet = new frame.variable({});
variablePool.languageSet.onChangeCall(elementRoot.get("root"), "changeLanguage");
srv.loadLanguage("simplify-chinese", (data, statusCode) => {
  if (statusCode === 200) {
    variablePool.languageSet.set(data);
  }
});

//test code
setTimeout(() => {
  variablePool.user_info.set("world");
}, (2000));

export { }
//event

window.addEventListener('resize', frame.throttle(function (event) {
  // Your code here
  console.log('Window resized to: ' + window.innerWidth + 'x' + window.innerHeight);
}, 500));
//exit confirm
window.addEventListener("beforeunload", function (e) {

  var confirmationMessage = 'It looks like you leaving. Are you sure? ';
  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  srv.pageUnloadEvent({},);
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.

});
