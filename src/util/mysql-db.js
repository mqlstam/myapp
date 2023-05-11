const mysql = require('mysql2/promise');

const logger = require('../util/utils').logger;

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'shareameal',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
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
