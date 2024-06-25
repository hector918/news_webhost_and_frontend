require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const { session } = require('./db/session');
const { user, session_info } = require('./controllers/user-control');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

//////////////////////////////////////////////////////
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100
});
app.use(limiter);
const corsOptions = {
  // origin: 'https://trusteddomain.com',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Session configuration
app.use(session);//adding ip to the session
app.use(session_info);
// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
/////////////////////////
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Hide the "secret" directory
app.use('/public/secret', (req, res, next) => {
  res.status(403).send('Forbidden');
});
app.get('/files', (req, res) => {
  public_path = path.join(__dirname, 'public')
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//controller route
app.use('/v1/user', user);

//base route
app.get('/testing', async (req, res) => {
  process.on('message', (msg) => {
    console.log(msg)
    if (msg.type === 'response') {
      console.log(`master response ${msg.result}`);
    }
  });
  process.send({ type: 'query_user_info', data: 'ab' });

  res.send('Hello, HTTPS world!');

});
///404
app.get('*', (req, res) => {
  res.status(404).send('404');
})

module.exports = app;