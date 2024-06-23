require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
//
// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Hide the "secret" directory
app.use('/public/secret', (req, res, next) => {
  res.status(403).send('Forbidden');
});

app.use('/v1/user', require('./controllers/user-control'));

app.get('/files', (req, res) => {
  public_path = path.join(__dirname, 'public')
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.send('Hello, HTTPS world!');
});

module.exports = app;