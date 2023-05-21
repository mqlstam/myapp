const database = require('../util/inmem-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const validator = require('validator');

const userController = {
  createUser: async (req, res, next) => {
    const { emailAdress, password, firstName, lastName, street, city } = req.body;

    // Validate the incoming data
    if (!emailAdress || !password) {
      return res.status(400).send({ error: "Email and password are required" });
    }
    if (!validator.isEmail(emailAdress)) {
      return res.status(400).send({ error: "Invalid emailAdress format" });
    }
    if (password.length < 8) {
      return res.status(400).send({ error: "Password must be at least 8 characters long" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query('SELECT emailAdress FROM user WHERE emailAdress = ?', [emailAdress]);
        if (rows.length > 0) {
          return res.status(409).send({ error: "Email already exists" });
        } else {
          const [result] = await conn.query('INSERT INTO user (firstname, lastname, emailAdress, password, street, city) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, emailAdress, hashedPassword, street, city]);
          // Return the data and identification number of the added user
          return res.send({ message: `Registered emailAdress ${emailAdress}`, data: { id: result.insertId, emailAdress } });
        }
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 500,
          message: 'Database error'
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      logger.error(error.message);
      return next({
        code: 500,
        message: 'Internal server error'
      });
    }
  },
  getAllUsers: async (req, res, next) => {
    logger.info('Get all users');

    let sqlStatement = 'SELECT * FROM `user`';
    // Handle the query parameters
    const queryParams = req.query;
    const validFields = ["isactive", "name", "emailAdressAdress"]; // You can add more valid fields here
    const sqlParams = [];
    let isFirst = true;
    for (const key in queryParams) {
      // Check if the query parameter is a valid field
      if (validFields.includes(key)) {
        // Check if the query parameter value is not empty or null
        if (queryParams[key]) {
          // Add the SQL code to filter by the query parameter
          if (isFirst) {
            sqlStatement += " WHERE `" + key + "`=?";
            isFirst = false;
          } else {
            sqlStatement += " AND `" + key + "`=?";
          }
          // Add the query parameter value to the sqlParams array
          sqlParams.push(queryParams[key]);
        }
      }
    }

    try {
      const conn = await pool.getConnection();
      try {
        const [results] = await conn.query(sqlStatement, sqlParams);
        logger.info('Found', results.length, 'results');
        return res.status(200).json({
          code: 200,
          message: 'User getAll endpoint',
          data: results
        });
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 409,
          message: error.message
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      logger.error(err.code, err.syscall, err.address, err.port);
      return next({
        code: 500,
        message: err.code
      });
    }
  },

  getUserProfile: async (req, res, next) => {
    const userId = req.userId;
    logger.trace('Get user profile for user', userId);
    console.log(userId);

    let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

    try {
      const conn = await pool.getConnection();
      try {
        const [results] = await conn.query(sqlStatement, [userId]);
        // Check if the user id is found
        if (results.length === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        // Look up the details of the associated meals taking place today or in the future
        const [meals] = await conn.query('SELECT * FROM `meal` WHERE id=?', [userId]);
        logger.trace('Found', results.length, 'results');
        return res.status(200).json({
          code: 200,
          message: 'Get User profile',
          data: { ...results[0], meals }
        });
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 409,
          message: error.message
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      logger.error(err.code, err.syscall, err.address, err.port);
      return next({
        code: 500,
        message: err.code
      });
    }
  },
  
  getUserById: async (req, res, next) => {
    // Get the user id from the request parameters
    const userId = req.params.id ;

    let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

    try {
      const conn = await pool.getConnection();
      try {
        const [results] = await conn.query(sqlStatement, [userId]);
        // Check if the user id is found
        if (results.length === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        // Look up the details of the associated meals taking place today or in the future
        const [meals] = await conn.query('SELECT * FROM `meal` WHERE Id=1 ', [userId]);
        return res.status(200).json({
          code: 200,
          message: 'Get User by id',
          data: { ...results[0], meals }
        });
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 409,
          message: error.message
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      logger.error(err.code, err.syscall, err.address, err.port);
      return next({
        code: 500,
        message: err.code
      });
    }
  },

  updateUser: async (req, res, next) => {
    // Get the user id from the request parameters
    const userId = req.params.id;
  
    // Extract the necessary fields from the request body
    const { emailAdress,password, firstName, lastName, phoneNumber, isActive, roles, street, city } = req.body;
    
    if (!emailAdress) {
        return res.status(400).send({ error: "Email is required" });
    }
    if (!validator.isEmail(emailAdress)) {
        return res.status(400).send({ error: "Invalid emailAdress format" });
    }
    if (password && password.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters long" });
    }
    if (phoneNumber && !validator.isMobilePhone(phoneNumber)) {
        return res.status(400).send({ error: "Invalid phone number" });
    }

    let sqlStatement = 'UPDATE `user` SET emailAdress=?, password=?, firstName=?, lastName=?, phoneNumber=?, isActive=?, roles=?, street=?, city=? WHERE id=?';
    let sqlParams = [emailAdress, password, firstName, lastName, phoneNumber, isActive, roles, street, city, userId];

    try {
        const conn = await pool.getConnection();
        try {
            const [user] = await conn.query('SELECT * FROM `user` WHERE id=?', [userId]);
            if (user.length === 0) {
                return res.status(404).send({ error: "User not found" });
            }

            const [emailAdressCheck] = await conn.query('SELECT * FROM `user` WHERE emailAdress=? AND id<>?', [emailAdress, userId]);
            if (emailAdressCheck.length > 0) {
                return res.status(409).send({ error: "Email already exists" });
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                sqlStatement = 'UPDATE `user` SET emailAdress=?, password=?, firstName=?, lastName=?, phoneNumber=?, isActive=?, roles=?, street=?, city=? WHERE id=?';
                sqlParams = [emailAdress, hashedPassword, firstName, lastName, phoneNumber, isActive, roles, street, city, userId];
            }

            const [result] = await conn.query(sqlStatement, sqlParams);

            return res.status(200).json({
                code: 200,
                message: 'Update User',
                data: { id: userId, emailAdress, phoneNumber, isActive, roles, street, city }
            });

        } catch (error) {
            logger.error(error.message);
            return next({
                code: 409,
                message: error.message
            });

        } finally {
            conn.release();
        }
    } catch (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        return next({
            code: 500,
            message: err.code
        });
    }
  },

  deleteUser: async (req, res, next) => {
    // Get the user id from the request parameters
    const userId = req.params.id;

    let sqlStatement = 'DELETE FROM `user` WHERE id=?';

    try {
      const conn = await pool.getConnection();

      try {
        // Check if the user id is found
        const [user] = await conn.query('SELECT * FROM `user` WHERE id=?', [userId]);
        if (user.length === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        // Delete the user data
        let sqlUpdateStatement = 'UPDATE `meal` SET `cookId`=NULL WHERE `cookId`=?';
        await conn.query(sqlUpdateStatement, [userId]);

        const [result] = await conn.query(sqlStatement, [userId]);
        // Return a confirmation message
        return res.status(200).json({
          code: 200,
          message: 'Delete User',
          data: { id: userId }
        });
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 409,
          message: error.message
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      logger.error(err.code, err.syscall, err.address, err.port);
      return next({
        code: 500,
        message: err.code
      });
    }
  },
};

module.exports = userController;
