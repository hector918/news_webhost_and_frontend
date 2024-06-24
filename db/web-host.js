const pgp = require("pg-promise")();
require("dotenv").config();

var connectionOptions = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // poolSize
  idleTimeoutMillis: 10000 // poolIdleTimeout
};

try {
  var db = pgp(connectionOptions);
  if (db) {
    db.oneOrNone("SET TIME ZONE 'US/Eastern';SELECT current_setting('TIMEZONE') AS current_timezone;")
      .then(res => console.log("database timezone", res))
      .catch(error => console.error("error setting timezone", error));
  }
} catch (error) {
  console.error("database connection error", error);
}


const table_name = {
  user_table_name: '\"users\"',

}

module.exports = { db, table_name };