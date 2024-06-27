import frame from './frame.js';


const spa_base = new frame.baseH({
  name: "i am the app base",
  structure: `
    <section class="hero is-primary">
      <div class="hero-body">
        <p class="title" id_="testing">Primary hero</p>
        <p class="subtitle">Primary subtitle</p>
      </div>
    </section>
  `,
  parent: document.querySelector("body"),
  render: {
    testing: function (str) {
      this.elements["testing"].innerHTML = str;
    }
  }

});


export { spa_base }
