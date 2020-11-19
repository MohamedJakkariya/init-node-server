/** @format */
const mysql = require('mysql');

const pool = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  acquireTimeout: 20000,
  multipleStatements: true,
  connectionLimit: 100,
  charset: 'utf8mb4',
  debug: false
});

module.exports = pool;
