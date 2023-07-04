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
      return res.status(400).json({ code: 400, message: "Required field is missing", data: {} });
    }
    if (!validator.isEmail(emailAdress)) {
      return res.status(400).json({ code: 400, message: "Invalid email address", data: {} });
    }
    if (password.length < 4) {
      return res.status(400).json({ code: 400, message: "Invalid password", data: {} });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query('SELECT emailAdress FROM user WHERE emailAdress = ?', [emailAdress]);
        if (rows.length > 0) {
          return res.status(403).json({ code: 403, message: "User already exists", data: {} });
        } else {
          const [result] = await conn.query('INSERT INTO user (firstname, lastname, emailAdress, password, street, city) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, emailAdress, hashedPassword, street, city]);
          // Return the data and identification number of the added user
          return res.status(200).json({ code: 200, message: "User successfully registered", data: { id: result.insertId, email: emailAdress } });
        }
      } catch (error) {
        logger.error(error.message);
        return next({
          code: 500,
          message: 'Database error',
          data: {}
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      logger.error(error.message);
      return next({
        code: 500,
        message: 'Internal server error',
        data: {}
      });
    }
  },
  
  getAllUsers: async (req, res, next) => {
    logger.info('Get all users');

    let sqlStatement = 'SELECT * FROM `user`';
    // Handle the query parameters
    const queryParams = req.query;
const validFields = ["id", "firstName", "lastName", "isActive", "emailAdress", "password", "phoneNumber", "roles", "street", "city"];

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
    const userId = req.params.userId;
  
    try {
      const conn = await pool.getConnection();
      try {
        // Retrieve the user details from the user table
        const [userResults] = await conn.query('SELECT * FROM `user` WHERE id=?', [userId]);
        if (userResults.length === 0) {
          // Return a 404 status if the user is not found
          return res.status(404).json({ error: 'User not found' });
        }
  
        // Retrieve the meals associated with the user as a cook that take place today or in the future
        const today = new Date();
        const [mealResults] = await conn.query('SELECT * FROM `meal` WHERE cook_id=? AND date >= ?', [userId, today]);
  
        // Return a success response with the user details and associated meals data
        return res.status(200).json({
          code: 200,
          message: 'Get user by ID',
          data: {
            user: userResults[0],
            meals: mealResults
          }
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
    const userId = req.params.userId;
  
    // Verify that the user making the request is the owner of the data being updated
    if (req.user !== userId) {
      return res.status(403).json({ error: "You can only update your own data" });
    }
  
    // Extract the necessary fields from the request body
    const { emailAdress, password, firstName, lastName, phoneNumber, isActive, roles, street, city } = req.body;
  
    // Verify that all required fields are present and valid
    if (!emailAdress) {
      return res.status(400).json({ error: "Email address is required" });
    }
  
    if (!validator.isEmail(emailAdress)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }
  
    if (password && password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
  
    if (phoneNumber && !validator.isMobilePhone(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
  
    try {
      const conn = await pool.getConnection();
      try {
        // Check if the user exists
        const [userResults] = await conn.query('SELECT * FROM `user` WHERE id=?', [userId]);
  
        if (userResults.length === 0) {
          // Return a 404 status if the user is not found
          return res.status(404).json({ error: 'User not found' });
        }
  
        // Check if the new email address is already in use by another user
        const [emailResults] = await conn.query('SELECT * FROM `user` WHERE emailAdress=? AND id<>?', [emailAdress, userId]);
  
        if (emailResults.length > 0) {
          // Return a 409 status if the email address is already in use
          return res.status(409).json({ error: 'Email address already in use' });
        }
  
        // Hash the password if it's included in the request body
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  
        // Update the user data in the database
        const [updateResults] = await conn.query('UPDATE `user` SET emailAdress=?, password=?, firstName=?, lastName=?, phoneNumber=?, isActive=?, roles=?, street=?, city=? WHERE id=?', [emailAdress, hashedPassword, firstName, lastName, phoneNumber, isActive, roles, street, city, userId]);
  
        // Return the updated user data
        return res.status(200).json({
          code: 200,
          message: 'User data updated',
          data: {
            id: userId,
            emailAdress,
            firstName,
            lastName,
            phoneNumber,
            isActive,
            roles,
            street,
            city
          }
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
    const userId = req.params.userId;
  
    // Verify that the user making the request is the owner of the data being deleted
    if (req.user !== userId) {
      return res.status(403).json({ error: "You can only delete your own data" });
    }
  
    try {
      const conn = await pool.getConnection();
      try {
        // Check if the user exists
        const [userResults] = await conn.query('SELECT * FROM `user` WHERE id=?', [userId]);
  
        if (userResults.length === 0) {
          // Return a 404 status if the user is not found
          return res.status(404).json({ error: 'User not found' });
        }
  
        // Delete the user data from the database
        const [deleteResults] = await conn.query('DELETE FROM `user` WHERE id=?', [userId]);
  
        // Return a success response with a confirmation message
        return res.status(200).json({
          code: 200,
          message: 'User deleted',
          data: {
            id: userId
          }
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
  }
}
module.exports = userController;
