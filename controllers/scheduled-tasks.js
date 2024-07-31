const { stat_update } = require('../db/logging');
const { generate_cluster_of_news } = require('../queries/embedding-host-request');
///////////////////////////////////////////////
function caller() {
  console.log("timer triggerd");

  const callback = () => {
    generate_cluster_of_news();
  }

  stat_update(callback);
}

module.exports = caller