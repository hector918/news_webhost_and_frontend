const { db: web_host_db, table_name } = require('../db/web-host');
const { logging, getLineNumberAndFileName } = require('../db/logging');

const get_user = async ({ email, id }) => {
  if (email === undefined && id === undefined) return false;
  const query = `SELECT * FROM users WHERE ${email != undefined ? `email = $[email]` : `id = $[id]`};`;
  try {
    const ret = await web_host_db.oneOrNone(query, { email, id });
    return ret !== null ? ret : false;
  } catch (error) {
    logging(error.toString(), getLineNumberAndFileName(), 3);
  }

}

const create_user = (email, password) => {

}

const update_user = (email) => {

}

const set_forgot_password = (email) => {

}

const set_user_disable = (email) => {

}

module.exports = { get_user }