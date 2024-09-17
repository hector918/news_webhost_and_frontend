require('dotenv').config();
const express = require("express");
const test = express.Router();
const { validateArrayBody } = require('../middleware');
const { logging, getLineNumberAndFileName } = require('../db/logging');
const fs = require('fs');
const zlib = require('zlib');
////////////////////////////////////////////
test.post("/", async (req, res) => {
  await req.common_wrapper(async () => {
    // console.log(req.body);
    return req.body;
  })
})

test.get("/", async (req, res) => {
  await req.common_wrapper(async () => {
    return 'Hello world!';
  })
})

test.post("/html_file_by_hash", validateArrayBody(200), async (req, res) => {
  await req.common_wrapper(async () => {

    const ret = {};
    for (let hash of req.body.hash_list) {
      const result = read_html_file_with_guessing_years(hash);
      if (result !== false) {
        ret[hash] = result;
      }
    }

    return ret;
  })
})

module.exports = { test };
//////////////////////////////////////////////////////////////////////////
function read_html_file_with_guessing_years(hash) {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = 0; i < 5; i++) years.push(currentYear - i);

  for (const year of years) {
    const filename = `${process.env.REMOTE_HTML_CONTENT}/${year}/${hash}.html`;
    if (fs.existsSync(filename)) return fs.readFileSync(filename, 'utf8');
  }
  return false;
}
