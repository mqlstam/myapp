//
// Authentication controller
//
const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');
const bcrypt = require('bcryptjs');

module.exports = {
  login(req, res, next) {
    const { emailAdress, password } = req.body;

    pool.getConnection(async (err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          code: 500,
          message: err.code
        });
      }
      if (connection) {
        try {
          const [users] = await connection.query('SELECT * FROM `user` WHERE emailAdress = ?', [emailAdress]);
          if (users.length === 0) {
            return res.status(401).send({ error: "Not Authorized" });
          }
          const user = users[0];
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            return res.status(401).send({ error: "Not Authorized" });
          }
          const payload = { userId: user.id };
          const token = jwt.sign(payload, jwtSecretKey);
          res.send({ token });
        } catch (error) {
          next({
            code: 500,
            message: error.message
          });
        } finally {
          connection.release();
        }
      }
    });
  },

  validateToken(req, res, next) {
    logger.trace('validateToken called');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        code: 401,
        message: 'Authorization header missing!',
        data: undefined
      });
    } else {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecretKey);
        req.userId = decoded.userId;
        next();
      } catch (error) {
        next({
          code: 401,
          message: 'Invalid token',
          data: undefined
        });
      }
    }
  }
};
