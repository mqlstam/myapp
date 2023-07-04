const database = require('../util/inmem-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const validator = require('validator');

const mealController = {
  addMeal: async (req, res, next) => {
    const { name, description, location, dateTime, maxParticipants } = req.body;

    // Validate the incoming data
    if (!name || !description || !location || !dateTime || !maxParticipants) {
      return res.status(400).json({ code: 400, message: "Required field is missing", data: {} });
    }
    if (!validator.isNumeric(maxParticipants.toString()) || maxParticipants < 1) {
      return res.status(400).json({ code: 400, message: "Invalid maxParticipants value", data: {} });
    }

    const userId = req.user.id;

    try {
      const conn = await pool.getConnection();
      try {
        const [result] = await conn.query('INSERT INTO meal (name, description, location, dateTime, maxParticipants, userId) VALUES (?, ?, ?, ?, ?, ?)', [name, description, location, dateTime, maxParticipants, userId]);

        // Return the data and identification number of the added meal
        return res.status(200).json({ code: 200, message: "Meal successfully added", data: { id: result.insertId, name: name, location: location } });
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
  updateMeal: async (req, res, next) => {
    const mealId = req.params.mealId;
    const { name, description, location, dateTime, maxParticipants } = req.body;

    // Validate the incoming data
    if ((!name && !description && !location && !dateTime && !maxParticipants) ||
        (maxParticipants && (!validator.isNumeric(maxParticipants.toString()) || maxParticipants < 1))) {
      return res.status(400).json({ code: 400, message: "Invalid input data", data: {} });
    }

    const userId = req.user.id;

    try {
      const conn = await pool.getConnection();
      try {
        // Check if the meal exists in the database
        const [meal] = await conn.query('SELECT * FROM meal WHERE id = ?', [mealId]);
        if (meal.length === 0) {
          return res.status(404).json({ code: 404, message: "Meal not found", data: {} });
        }

        // Check if the user is the owner of the meal
        if (meal[0].userId !== userId) {
          return res.status(403).json({ code: 403, message: "User is not the owner of the meal", data: {} });
        }

        // Update the meal with the new data
        const updateValues = [];
        const updateFields = [];
        if (name) {
          updateValues.push(name);
          updateFields.push('name = ?');
        }
        if (description) {
          updateValues.push(description);
          updateFields.push('description = ?');
        }
        if (location) {
          updateValues.push(location);
          updateFields.push('location = ?');
        }
        if (dateTime) {
          updateValues.push(dateTime);
          updateFields.push('dateTime = ?');
        }
        if (maxParticipants) {
          updateValues.push(maxParticipants);
          updateFields.push('maxParticipants = ?');
        }
        if (updateFields.length === 0) {
          return res.status(400).json({ code: 400, message: "No valid fields to update", data: {} });
        }

        const updateQuery = `UPDATE meal SET ${updateFields.join(', ')} WHERE id = ?`;
        await conn.query(updateQuery, [...updateValues, mealId]);

        return res.status(200).json({ code: 200, message: "Meal successfully updated", data: { id: mealId, name: name || meal[0].name, location: location || meal[0].location } });
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
  getAllMeals: async (req, res, next) => {
    try {
      const conn = await pool.getConnection();
      try {
        const [meals] = await conn.query('SELECT id, name, description, location, dateTime, maxParticipants, userId FROM meal');

        return res.status(200).json({ code: 200, message: "List of meals returned", data: meals });
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

  getMealById: async (req, res, next) => {
    const mealId = req.params.mealId;

    try {
      const conn = await pool.getConnection();
      try {
        // Check if the meal exists in the database
        const [meal] = await conn.query('SELECT id, title, description, date, time, location, maxParticipants, cookId FROM meal WHERE id = ?', [mealId]);
        if (meal.length === 0) {
          return res.status(404).json({ code: 404, message: "Meal not found", data: {} });
        }

        return res.status(200).json({ code: 200, message: "Details van maaltijd geretourneerd", data: meal[0] });
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

  deleteMeal: async (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.user.id;

    try {
      const conn = await pool.getConnection();
      try {
        // Check if the meal exists in the database
        const [meal] = await conn.query('SELECT * FROM meal WHERE id = ?', [mealId]);
        if (meal.length === 0) {
          return res.status(404).json({ code: 404, message: "Meal not found", data: {} });
        }

        // Check if the user is the owner of the meal
        if (meal[0].userId !== userId) {
          return res.status(403).json({ code: 403, message: "User is not the owner of the meal", data: {} });
        }

        // Delete the meal and its registrations
        await conn.query('DELETE FROM meal_registration WHERE mealId = ?', [mealId]);
        await conn.query('DELETE FROM meal WHERE id = ?', [mealId]);

        return res.status(200).json({ code: 200, message: `Maaltijd met ID ${mealId} is verwijderd`, data: {} });
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
  // Other methods for meal-related functionality can be added here
};

module.exports = mealController;