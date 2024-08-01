require('dotenv').config();
const express = require("express");
const news = express.Router();
const { logging, getLineNumberAndFileName } = require('../db/logging');
const { read_lastest_record_from_news_cluster } = require('../queries/news-cluster');
//////////////////////////////////////////////////////
news.get("/lastest", async (req, res) => {
  await req.common_wrapper(async () => {
    const ret = await read_lastest_record_from_news_cluster();
    console.log(ret);

  })
})
//////////////////////////////////////////////////////
module.exports = { news };

