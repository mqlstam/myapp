const mysql = require('mysql2/promise');

const logger = require('../util/utils').logger;

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'shareameal',
  port: process.env.DB_PORT || 3300,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0
});

pool.on('connection', function (connection) {
  logger.info(
    `Connected to db '${connection.config.database}' on ${connection.config.host}`
  );
});

pool.on('acquire', function (connection) {
  logger.trace('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  logger.trace('Connection %d released', connection.threadId);
});

module.exports = pool;
