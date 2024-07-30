const { logDB_control_panel_code } = require('../variables');
const pgp = require("pg-promise")();
require("dotenv").config();

var connectionOptions = {
  connectionString: process.env.LOGGING_DB_URL,
  max: 10, // poolSize
  idleTimeoutMillis: 10000 // poolIdleTimeout
};

try {
  var db = pgp(connectionOptions);
  if (db) {
    db.oneOrNone("SET TIME ZONE 'US/Eastern';SELECT current_setting('TIMEZONE') AS current_timezone;")
      .then(res => console.log("database LOGGING_DB_URL timezone", res))
      .catch(error => console.error("LOGGING_DB_URL error setting timezone", error));
  }
} catch (error) {
  console.error("database connection error", error);
}
/*
log level 
0 = normal
1 = warning
2 = user error
3 = system error
4 = code block error catch
*/
const access_logging = (ip, path, email, time_lapse) => {
  (async () => {
    console.log(ip, path, email, time_lapse);
    let session = null;
    try {
      // Acquire a new session
      session = await db.connect({ direct: true });
      // Start a transaction within the session
      await session.tx(async t => {
        // Execute the INSERT query
        const insertQuery = `
          INSERT INTO web_host_access_log
          (ip, access_path, email, time_lapse)
          VALUES
          ($[ip], $[path], $[email], $[time_lapse]);
        `;
        t.oneOrNone(insertQuery, { ip, path, email, time_lapse })

      });
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      // Release the session
      if (session) {
        session.done(); // Release the session back to the pool
      }
    }
  })()
}
const logToDatabase = (message, line_at, level = 0) => {
  (async () => {
    let session = null;
    try {
      // Acquire a new session
      session = await db.connect({ direct: true });
      // Start a transaction within the session
      await session.tx(async t => {
        // Execute the INSERT query
        const insertQuery = `
          INSERT INTO web_host_running_log
          (level, message, code_line_at)
          VALUES
          ($[level], $[message], $[line_at]);
        `;
        t.oneOrNone(insertQuery, { message, line_at, level });
      });
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      // Release the session
      if (session) {
        session.done(); // Release the session back to the pool
      }
    }
  })()
}

const logging = (message, line_at) => {
  console.log(message, line_at);
  logToDatabase(message, line_at, 0);
};

logging.info = (message, line_at) => {
  console.info('INFO:', message, line_at);
  logToDatabase(message, line_at, 1);
};

logging.error = (message, line_at) => {
  console.error('ERROR:', message, line_at);
  logToDatabase(message, line_at, 2);
};

function stat_update(callback) {
  const query = `SELECT * FROM control_panel`;
  if (db) {
    db.manyOrNone(query)
      .then(res => {
        for (let key in res) {
          logDB_control_panel_code[res[key]['name']] = { ...res[key] };
        }
        if (callback) callback();
      })
      .catch(error => console.error("logdb table control_panel error", error));
  }
}


function getLineNumberAndFileName() {
  const stack = new Error().stack;
  // 分割堆栈信息，取第二行
  const stackLine = stack.split("\n")[2];
  // 使用正则表达式匹配行号和文件名
  const match = stackLine.match(/\((.*):(\d+):(\d+)\)/);
  if (match) {
    const filePath = match[1];
    const lineNumber = match[2];
    const columnNumber = match[3];
    return `${filePath}, ${lineNumber}, ${columnNumber}`;
  }
  return null;
}
module.exports = {
  db,
  logging,
  access_logging,
  getLineNumberAndFileName,
  stat_update
};
/*

*/