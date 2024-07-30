const { stat_update } = require('../db/logging');

function caller(callback) {

  console.log("timer triggerd");
  stat_update(callback);
}

module.exports = caller