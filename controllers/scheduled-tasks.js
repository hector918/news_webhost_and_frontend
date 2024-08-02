const { logDB_control_panel_code } = require('../running-memory');

const { stat_update } = require('../db/logging');
const { generate_cluster_of_news } = require('../queries/embedding-host-request');
///////////////////////////////////////////////
function scheduled_tasks() {
  console.log("timer triggerd");
  const callback = () => {
    generate_cluster_of_news();
  }

  stat_update(callback);
}

function init() {
  console.log(`scheduled_tasks called`);
  stat_update((res) => {
    for (const key in res) {
      logDB_control_panel_code[key] = res[key];
    }

    generate_cluster_of_news();
  });

  // Asynchronous timed task
  setInterval(() => {
    scheduled_tasks()
  }, 1000 * 60 * 60); // 1 hour

}

module.exports = init