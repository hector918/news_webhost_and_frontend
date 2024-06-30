import frame from './frame.js';
const elementRoot = frame.elementRoot;
new frame.baseH({
  name: "root",
  structure: `<div id_="root_div"></div>`,
  parent: document.querySelector("body"),
});
console.log(elementRoot)
elementRoot.setRoute("/testing/game.index?variable='hello world&abcd=e231/kkk", () => {
  const testing = new frame.baseH({
    name: "testing",
    structure: `<div id_="testing_">testing</div>`,
    parent: elementRoot.elementList["root"].elements["root_div"],
  });
  const gameIndex = new frame.baseH({
    name: "game.index",
    structure: `<div id_="game.index">game.index</div>`,
    parent: testing.elements["testing_"],
  });
  const kkk = new frame.baseH({
    name: "kkk",
    structure: `<div id_="kkk">kkk</div>`,
    parent: gameIndex.elements["game.index"],
  });
})

elementRoot.goRoute("/testing/game.index?variable='hello world&abcd=e231/kkk");

//
let navbar = new frame.baseH({
  name: "navbar",
  structure: `
    <nav class="navbar is-fixed-top is-link" role="navigation" aria-label="main navigation">
    <div class="navbar-brand is-flex-grow-1">
      <a class="navbar-item" href="https://bulma.io">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 110L10 40L50 0L100 50L70 80L110 120L50 160L0 110Z" fill="#00D1B2"/>
      </svg>

      </a>
      <div class="navbar-item is-justify-content-space-around is-flex-grow-1">
        <a class="navbar-item">testing</a>
        <a class="navbar-item">testing</a>
        <a class="navbar-item">testing</a>
        <a class="navbar-item">testing</a>
        
      </div>
      
    </div>
  </nav>
  `,
  parent: elementRoot.get("root").elements['root_div'],
  render: {
    testing: function (str) {
      this.elements["testing"].innerHTML = str;
    }
  }
});

const user_info = new frame.varH();
// user_info.onChangeCall({ component: spa_base, renderHandle: "testing" });

user_info.set("hello world");
user_info.set("hello world1");
user_info.set("hello world2");



export { navbar }

//event

window.addEventListener('resize', frame.throttle(function (event) {
  // Your code here
  console.log('Window resized to: ' + window.innerWidth + 'x' + window.innerHeight);
}, 500));