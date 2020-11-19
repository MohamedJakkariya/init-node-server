require('dotenv').config();
var express = require('express');
var logger = require('morgan');
const path = require('path');

// Set default root path
global.ROOT_PATH = path.resolve(__dirname);

// Configuration variables
const app = express();
app.use(logger('dev'));

module.exports = app;
