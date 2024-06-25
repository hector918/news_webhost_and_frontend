
users_map = new Map();
users_map.set("a", 1);


function masterProcessQuery(type, data) {
  switch (type) {
    case "query_user_info":
      return users_map.get(data);

    default:
      return "unknown";
  }
}

module.exports = { masterProcessQuery }