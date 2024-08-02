const { get_user } = require('./queries/users-query');
const users_map = new Map();
const logDB_control_panel_code = {};
function masterProcessQueries(msgs) {
  const ret = {};
  for (const [key, value] of Object.entries(msgs)) {
    ret[key] = one_query(key, value);
  }
  return ret;
  //
  function one_query(type, data) {
    switch (type) {
      case "query_user_info":
        return users_map.get(data);
      case "update_user_info":
        return users_map.set(data.user_name, data.user_info);
      case "set_control_panel":

        return logDB_control_panel_code[type] = data;
      case "get_control_panel":
        return logDB_control_panel_code[type] || undefined;
      default:
        return "unknown";
    }
  }

}

module.exports = { masterProcessQueries, logDB_control_panel_code }