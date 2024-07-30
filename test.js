const st = require('./controllers/scheduled-tasks');
const { generate_cluster_of_news } = require('./queries/embedding-host-request');
st(generate_cluster_of_news);
