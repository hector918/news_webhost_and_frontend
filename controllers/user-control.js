require('dotenv').config();
const express = require("express");
const user = express.Router();
const nodemailer = require('nodemailer');

// In-memory user database (for demonstration purposes only)
const users = [];

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Registration endpoint
user.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome!',
    text: 'Thank you for registering!'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error sending email');
    }
    res.send('Registration successful! Please check your email.');
  });
});

// Login endpoint
user.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (user && await bcrypt.compare(password, user.password)) {
    // Example of saving IP with session data
    req.session.ip = req.ip;
    req.session.user = user;
    // Save the session
    req.session.save((err) => {
      if (err) {
        // Handle error
        console.error(err);
        res.status(500).send('Session save error');
      } else {
        res.send('Session saved');
      }
    });
    res.send('Login successful!');
  } else {
    res.status(401).send('Invalid email or password');
  }
});

// Protected endpoint
user.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to your dashboard, ${req.session.user.email}!`);
  } else {
    res.status(401).send('Please login first');
  }
});

// Logout endpoint
user.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.send('Logout successful');
  });
});

const session_info = (req, res, next) => {
  req.session.ip = req.ip;
  next();
}

const vaildate_login = (req, res, next) => {
  // if()
}

module.exports = { user, session_info, vaildate_login };
