require('dotenv').config();
const express = require("express");
const news = express.Router();
const { logging, getLineNumberAndFileName } = require('../db/logging');
const { read_lastest_record_from_news_cluster } = require('../queries/news-cluster');
const { get_news_html_by_hash_list } = require('../queries/embedding-host-request');
const { validateArrayBody } = require('../middleware');
//////////////////////////////////////////////////////
news.get("/lastest", async (req, res) => {
  await req.common_wrapper(async () => {
    const ret = await read_lastest_record_from_news_cluster();
    return ret;
  })
});

news.post("/read_news_by_hash_list", validateArrayBody(200), async (req, res) => {

  await req.common_wrapper(async () => {
    const ret = await get_news_html_by_hash_list(req.body.hash_list);
    return ret;
  })
});
//////////////////////////////////////////////////////
module.exports = { news };

