const session = require('express-session');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
const cookie_expire_limit = 30;// unit day
// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.SESSION_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Extend connect-pg-simple to store IP address
class CustomPgSessionStore extends pgSession {
  constructor(options) {
    super(options);
    this.pool = options.pool;
    this.tableName = options.tableName || 'session';
  }
  async set(sid, sess, cb) {
    const ip = sess.ip; // Assuming `ip` is passed in `sess`
    delete sess.ip;     // Remove `ip` from session data
    const data = JSON.stringify(sess);
    const query = `
      INSERT INTO session (sid, sess, ip, expire) 
      VALUES ($1, $2, $3, NOW() + interval '${cookie_expire_limit} days')
      ON CONFLICT (sid) DO UPDATE 
      SET sess = $2, ip = $3, expire = NOW() + interval '${cookie_expire_limit} days' 
      RETURNING sid;`;
    try {
      await this.pool.query(query, [sid, data, ip]);
      cb && cb();
    } catch (err) {
      cb && cb(err);
    }
  }
}
// Configure session middleware
const session_for_app = session({
  store: new CustomPgSessionStore({
    pool: pool,                // Connection pool
    tableName: 'session'       // Table to store sessions
  }),
  secret: process.env.SESSION_SECRET, // Session secret
  resave: false,                      // Don't resave sessions if unmodified
  saveUninitialized: true,            // Save uninitialized sessions
  cookie: {
    secure: true,                     // Cookies only over HTTPS
    maxAge: cookie_expire_limit * 24 * 60 * 60 * 1000  // 30 days in milliseconds
  }
});

module.exports = { session: session_for_app };
