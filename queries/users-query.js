const { db: web_host_db, table_name } = require('../db/web-host');
const { logging, getLineNumberAndFileName } = require('../db/logging');

const get_user = async ({ email, id }) => {
  if (email === undefined && id === undefined) return false;
  const query = `SELECT * FROM ${table_name['user_table_name']} WHERE ${email != undefined ? `email = $[email]` : `id = $[id]`};`;
  try {
    const ret = await web_host_db.oneOrNone(query, { email, id });
    return ret !== null ? ret : false;
  } catch (error) {
    logging(error.toString(), getLineNumberAndFileName(), 3);
  }
}

const create_user = async (name, email, password, password_salt) => {
  try {
    const insertQuery = `
      INSERT INTO ${table_name['user_table_name']} (name, email, password, password_salt, create_at)
      VALUES ($[name], $[email], $[password], $[password_salt], $[create_at])
      RETURNING id;
    `;
    const create_at = new Date().toUTCString();
    const result = await web_host_db.oneOrNone(insertQuery, { name, email, password, password_salt, create_at });
    return result;
  } catch (error) {
    logging(error.message, getLineNumberAndFileName(), 3);
    return { error: error.message };
  }
}

const update_user = (email) => {

}

const set_forgot_password = (email) => {

}

const set_user_disable = (email) => {

}

module.exports = { get_user, create_user }