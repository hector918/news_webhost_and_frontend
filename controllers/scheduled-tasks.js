const { generate_cluster_of_news } = require('../queries/embedding-host-request');
///////////////////////////////////////////////
function scheduled_tasks() {
  console.log("timer triggerd");
  generate_cluster_of_news();
}

async function init() {
  console.log(`scheduled_tasks called`);

  // for test
  // await generate_cluster_of_news();

  // Asynchronous timed task
  setInterval(() => {
    scheduled_tasks()
  }, 1000 * 60 * 60); // 1 hour

}

module.exports = init