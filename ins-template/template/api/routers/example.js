const express = require('express');
const chalk = require('chalk');
const Logger = require('js-logger');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const pool = require('../../config');
const { poolConnect } = require('../../db');
const BadRequest = require('../Errors/BadRequest');

const router = express.Router();

/**
 * @type : get
 * @access :
 * @description :
 * @requires :
 */
router.get('/test', async (req, res) => {
  try {
    // get a pool connection
    const connection = await poolConnect(pool);
    try {
      // make your code here
    } finally {
      pool.releaseConnection(connection);
    }
  } catch (err) {
    /** Customize error handling example */

    // 400
    if (err instanceof BadRequest)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ result: false, error: getReasonPhrase(StatusCodes.BAD_REQUEST), message: err.message });

    // 500
    if (err.code)
      Logger.info(chalk`code : {red ${err.code}}\nmessage : {yellow ${err.sqlMessage}}\nsql : {green ${err.sql}}`);
    else Logger.info(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
  }
});

module.exports = router;
