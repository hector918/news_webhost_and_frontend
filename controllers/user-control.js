require('dotenv').config();
const express = require("express");
const user = express.Router();
const nodemailer = require('nodemailer');
const { create_user, get_user } = require('../queries/users-query');
const bcrypt = require('bcrypt');
const { logging, getLineNumberAndFileName } = require('../db/logging');

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
  await req.common_wrapper(async () => {
    const { email, password } = req.body;

    // Generate a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const ret = await create_user(randomAnonymousName(), email, hashedPassword, salt);

    if (ret.id !== undefined) {//success
      req.session.email = email;
      req.session.ip = `${req.socket?.remoteAddress}:${req.socket?.remotePort}`;

      req.session.save((err) => {
        if (err) {
          logging(`session save error ${err.message}`, getLineNumberAndFileName(), 3);
        }
      });
      return ret.id;
    } else {//error
      throw new Error(ret.error);
    }

    // const mailOptions = {
    //   from: process.env.EMAIL,
    //   to: email,
    //   subject: 'Welcome!',
    //   text: 'Thank you for registering!'
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     return res.status(500).send('Error sending email');
    //   }
    //   res.send('Registration successful! Please check your email.');
    // });
  })

});

// Login endpoint
user.post('/login', async (req, res) => {
  await req.common_wrapper(async () => {
    const { email, password } = req.body;
    const user = await get_user({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user_info = user;
      // Save the session
      req.session.save((err) => {
        if (err) {
          // Handle error
          console.error(err);
        }
      });
      return 'Login successful!';
    } else {
      throw new Error("Invalid email or password");
    }
  })

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
user.get('/logout', async (req, res) => {
  await req.common_wrapper(async () => {
    req.session.destroy((err) => {
      if (err) {
        logging('Error logging out', getLineNumberAndFileName(), 3);
      }

    });
    return 'Logout successful';
  })

});

const vaildate_login = (req, res, next) => {
  // const user = req.user_info
  if (req.session.user_info === undefined) {
    res.status(401).json({ "error": "unauthorized access" });
  }
}

module.exports = { user, vaildate_login };


function randomAnonymousName() {
  const adjectives = [
    "Mysterious", "Invisible", "Silent", "Hidden", "Secret", "Cryptic", "Shadowy", "Masked", "Unknown", "Nameless",
    "Enigmatic", "Elusive", "Obscure", "Veiled", "Unseen", "Dark", "Cloaked", "Disguised", "Anonymous", "Stealthy",
    "Cunning", "Sly", "Untraceable", "Vague", "Furtive", "Covert", "Surreptitious", "Latent", "Discrete", "Concealed",
    "Esoteric", "Arcane", "Mystic", "Recondite", "Transcendent", "Hidden", "Recondite", "Sphinxlike", "Occult",
    "Puzzling", "Inscrutable", "Delphic", "Unfathomable", "Impenetrable", "Mysterious", "Cryptic", "Shadowed",
    "Shaded", "Dim", "Dusky", "Foggy", "Murky", "Nebulous", "Shadowy", "Obscured", "Shrouded", "Blurred",
    "Masked", "Camouflaged", "Hooded", "Caped", "Cowled", "Hooded", "Hatted", "Coifed", "Cloaked", "Veiled",
    "Unidentifiable", "Unknown", "Unspecified", "Nameless", "Unnamed", "Unlabeled", "Undesignated", "Undisclosed",
    "Coded", "Ciphered", "Numbered", "Unfamiliar", "Strange", "Peculiar", "Unusual", "Odd", "Bizarre", "Weird",
    "Eccentric", "Quirky", "Curious", "Abstruse", "Ambiguous", "Dark", "Incomprehensible", "Opaque", "Perplexing",
    "Puzzling", "Recondite", "Secret", "Unknown", "Hidden", "Undisclosed", "Unrevealed", "Obscured"
  ];

  const nouns = [
    "Wanderer", "Stranger", "Phantom", "Ghost", "Specter", "Enigma", "Cipher", "Mystery", "Shade", "Nomad",
    "Voyager", "Traveler", "Rover", "Pilgrim", "Nomad", "Drifter", "Vagabond", "Wayfarer", "Adventurer", "Seeker",
    "Explorer", "Pioneer", "Pathfinder", "Discoverer", "Navigator", "Trailblazer", "Pilgrim", "Nomadic", "Journeyman",
    "Wayfarer", "Globetrotter", "Wanderlust", "Odysseus", "Argonaut", "Odyssean", "Pilgrim", "Roamer", "Wayfarer",
    "Outlander", "Foreigner", "Alien", "Expatriate", "Emigrant", "Sojourner", "Transient", "Stranger", "Unknown",
    "Mystery", "Conundrum", "Riddle", "Puzzle", "Enigma", "Quandary", "Paradox", "Mystification", "Brainteaser",
    "Poser", "Riddle", "Whodunit", "Anagram", "Cryptogram", "Enigmatic", "Puzzling", "Sphinx", "Riddle", "Labyrinth",
    "Maze", "Conundrum", "Perplexity", "Stumper", "Teaser", "Jigsaw", "Puzzle", "Mystery", "Riddle", "Enigma",
    "Puzzle", "Conundrum", "Paradox", "Mystery", "Riddle", "Cryptic", "Puzzling", "Perplexing", "Labyrinth",
    "Maze", "Complexity", "Enigma", "Puzzle", "Riddle", "Mystery", "Labyrinth", "Maze", "Tangle", "Web",
    "Sphinx", "Riddle", "Puzzle", "Enigma", "Mystery", "Riddle", "Labyrinth", "Maze", "Puzzle", "Tangle"
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective} ${randomNoun}`;
};
