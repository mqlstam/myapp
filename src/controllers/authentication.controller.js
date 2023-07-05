const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');
const bcrypt = require('bcryptjs');

module.exports = {
  login(req, res, next) {
    const { emailAdress, password } = req.body;
    logger.trace('login called');
    if (!emailAdress || !password) {
      return res.status(400).send({
        status:400,
        message: "Required field is missing",
        data: {}
      });
    }

    pool.getConnection()
      .then(connection => {
        connection.query('SELECT * FROM `user` WHERE emailAdress = ?', [emailAdress])
          .then(([users]) => {
            if (users.length === 0) {
              return res.status(404).send({ error: "User not found" }); // Return 404 instead of 400
            }

            const user = users[0];
            return bcrypt.compare(password, user.password)
              .then(passwordMatch => {
                if (!passwordMatch) {
                  return res.status(400).send({ error: "Invalid password" });
                }
                const payload = { userId: user.id };
                const token = jwt.sign(payload, jwtSecretKey);
                res.send({
                  status:200,
                  data: {
                    id: user.id,
                    email: user.emailAdress,
                    token
                  },
                  message: "Login successful"
                });
              });
          })
          .catch(error => {
            next({
              status:500,
              message: error.message
            });
          })
          .finally(() => {
            connection.release();
          });
      })
      .catch(err => {
        logger.error('Error getting connection from pool');
        next({
          status:500,
          message: err.code
        });
      });
  },

  validateToken(req, res, next) {
    logger.trace('validateToken called');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        status:401,
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
          status:401,
          message: 'Invalid token',
          data: undefined
        });
      }
    }
  }
};