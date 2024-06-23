const pgp = require("pg-promise")();
require("dotenv").config();

var connectionOptions = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  poolSize: 10,
  poolIdleTimeout: 10000
};

try {
  var db = pgp(connectionOptions);
  if (db) db.oneOrNone("SET TIME ZONE 'US/Eastern';SELECT current_setting('TIMEZONE') AS current_timezone;").then(res => console.log("database timezone", res));
} catch (error) {
  console.error("database connection error", error);
}

const table_name = {

}

module.exports = { db, table_name };