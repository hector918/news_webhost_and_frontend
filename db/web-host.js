const pgp = require("pg-promise")();
require("dotenv").config();

var connectionOptions = {
  connectionString: process.env.WEB_HOST_DB_URL,
  max: 10, // poolSize
  idleTimeoutMillis: 10000 // poolIdleTimeout
};

try {
  var db = pgp(connectionOptions);
  if (db) {
    db.oneOrNone("SET TIME ZONE 'US/Eastern';SELECT current_setting('TIMEZONE') AS current_timezone;")
      .then(res => console.log("database WEB_HOST_DB_URL timezone", res))
      .catch(error => console.error("WEB_HOST_DB_URL error setting timezone", error));
  }
} catch (error) {
  console.error("database connection error", error);
}


const table_name = {
  user_table_name: '\"users\"',

}

module.exports = { db, table_name };