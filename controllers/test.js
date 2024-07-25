require('dotenv').config();
const express = require("express");
const test = express.Router();
const { logging, getLineNumberAndFileName } = require('../db/logging');

test.post("/", async (req, res) => {
  await req.common_wrapper(async () => {
    console.log(req.body);
    return req.body;
  })
})

module.exports = { test };

