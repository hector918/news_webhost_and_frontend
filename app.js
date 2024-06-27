require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require("connect-redis").default
const { session_redis } = require('./db/session-redis');
const { user } = require('./controllers/user-control');
const { logging, access_logging } = require('./db/logging');
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
app.use(session({
  store: new RedisStore({
    client: session_redis,
    prefix: "news_users_session:",
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
  }
}));
// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
/////////////////////////
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Hide the "secret" directory

//添加公用变量，以及通过函数到req
app.use((req, res, next) => {
  process.on('message', ({ type, result }) => {
    // for (const key in result) {
    //   switch (result) {
    //     case "query_user_info":
    //       req.user_info = result[key];
    //       break;
    //   }
    // }
    const start_time = new Date().getTime();

    next();
    const lapse = new Date().getTime() - start_time;
    const ip = req !== undefined ? `${req.socket?.remoteAddress}:${req.socket?.remotePort}` : undefined;
    const url = req?.url || undefined;
    access_logging(ip, url, req.session?.user_info?.email, lapse);

  });
  //此处暂时没有作用
  process.send({ 'query_user_info': "email" });
  req.common_wrapper = async (fn) => {
    try {
      res.json({ "payload": await fn() });
    } catch (error) {
      res.status(500).json({ "error": error.message });
    }
  }
});


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
  res.send('Hello, HTTPS world!');
});
///404
app.get('*', (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).send('404');
  }
})

module.exports = app;