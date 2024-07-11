require('dotenv').config();
const express = require("express");
const news = express.Router();
const { logging, getLineNumberAndFileName } = require('../db/logging');

news.get("/", async (req, res) => {
  await req.common_wrapper(async () => {

  })
})

module.exports = { news };

