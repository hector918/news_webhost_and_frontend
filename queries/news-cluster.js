const { db: web_host_db, pgp, table_name } = require('../db/web-host');
const { logging, getLineNumberAndFileName } = require('../db/logging');
/////////////////////////////////////////////////

const save_to_news_cluster = async (record) => {
  const query = `INSERT INTO${table_name['news_cluster']} (cluster, related_neighbors) VALUES ($[cluster], $[related_neighbors]) RETURNING id;`;
  const ret = await web_host_db.oneOrNone(query, { cluster: record.cluster, related_neighbors: record.related_neighbors });
  return ret;
}

const read_lastest_record_from_news_cluster = () => {

}
/////////////////////////////////////////////////
module.exports = { save_to_news_cluster }
