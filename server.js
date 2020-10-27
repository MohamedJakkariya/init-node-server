/** @format */

require('dotenv').config();
const path = require('path');

import { connect } from './config/db';

// Set default root path
global.ROOT = path.resolve(__dirname);

console.log(ROOT);

// set db connections 
connect();
