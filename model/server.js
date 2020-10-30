/** @format */

require('dotenv').config();
var express = require('express');
var logger = require('morgan');
const path = require('path');

const { connect } = require('./config/db');

// Set default root path
global.ROOT_PATH = path.resolve(__dirname);

// Configuration variables
const app = express();
app.use(logger('dev'));

// Established Configured databse connection
connect();

module.exports = app;
