import frame from './frame.js';
const elementRoot = frame.elementRoot;
new frame.baseH({
  name: "root",
  structure: `
    <div class="is-flex root_ is-flex-grow-1" id_="root_div"></div>
  `,
  parent: document.querySelector("body"),
});
//0	1	1	2	3	5	8	13	21	34	55
new frame.baseH({
  name: "loading",
  structure: `
    <div class="loading_div_h" id_="loading_div_h">
      <svg width="100px" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0"
        xml:space="preserve">
        <rect x="20" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="0.1" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="30" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="0.2s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="40" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="0.3s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="50" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="0.5" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="60" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="0.8s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="70" y="50" width="4" height="10" fill="#fff">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
            begin="1.3s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
      </svg>
    </div>
  `,
  parent: document.querySelector("body"),
});

//
new frame.baseH({
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
        <a class="navbar-item" id_="button-1">testing</a>
        <a class="navbar-item" id_="button-2">testing</a>
        <a class="navbar-item" id_="button-3">testing</a>
        <a class="navbar-item" id_="button-4">testing</a>
        
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
        elementRoot.goRoute("/mainPanel/news.index/kkk");
      }
    }
  ]

});

// elementRoot.setRoute(
//   "/",
//   () => {

//   }
// )

elementRoot.setRoute("/?testing=true", (params) => {
  new frame.baseH({
    name: "mainPanel",
    structure: `<div class="is-flex-grow-1" id_="main_panel">testing</div>`,
    parent: elementRoot.elementList["root"].elements["root_div"],
  });
});

elementRoot.setRoute("/mainPanel/game.index?variable='hello world&abcd=e231/kkk", (function (params) {
  const gameIndex = new frame.baseH({
    name: "game.index",
    structure: `<div id_="game.index">game.index</div>`,
    parent: this.elementList["mainPanel"].elements['main_panel'],
  });
  const kkk = new frame.baseH({
    name: "kkk",
    structure: `<div id_="kkk">wohoo</div>`,
    parent: gameIndex.elements["game.index"],
  });
}));

elementRoot.setRoute("/mainPanel/news.index/kkk", (function (params) {
  const newsIndex = new frame.baseH({
    name: "news.index",
    structure: `<div id_="news.index">news.index</div>`,
    parent: this.elementList["mainPanel"].elements['main_panel'],
  });
  const kkk = new frame.baseH({
    name: "kkk",
    structure: `<div id_="kkk">kkk</div>`,
    parent: newsIndex.elements["news.index"],
  });
}));

elementRoot.goRoute("/");

const user_info = new frame.varH();
user_info.onChangeCall({ component: elementRoot.get("navbar"), renderHandle: "testing" });

user_info.set("hello world");

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
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.

});