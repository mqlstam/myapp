
const pool = require('../util/mysql-db');
const logger = require('../util/utils').logger;

module.exports = {
  async getAllMeals(req, res) {
    const meals = await pool.query(
      'SELECT id, name, description, imageurl, datetime, maxamountofparticipants, price, cookid FROM meal' 
    );
    return res.status(200).json(meals);
  },

  async getMealById(req, res) {
    const { mealId } = req.params;
    const [meal] = await pool.query(
      'SELECT id, name, description, imageurl, datetime, maxamountofparticipants, price, cookid FROM meal WHERE id = ?', 
      [mealId]  
    );
    if (meal.length === 0) {
      return res.status(404).json({ status:404, message: "Meal not found" });  
    }
    return res.status(200).json(meal[0]);   
  },

  async addMeal(req, res) {
    if (!req.userId) {
      return res.status(401).json({ status:401, message: "Not logged in" });
    }
  
    const { name, description, dateTime, maxAmountOfParticipants, isActive, isVega, isVegan, isToTakeHome, price, imageUrl, allergenes } = req.body;
  
    logger.info(`Received data: ${JSON.stringify(req.body)}`);
  
    if (!name || !price || !maxAmountOfParticipants) {
      logger.info('One or more required fields are missing.');
      return res.status(400).json({ status:400, message: "Required field is missing" });
    }
  
    const cookId = req.userId.id;
    const [result] = await pool.query('INSERT INTO meal (name, description, dateTime, cookId, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, description, dateTime, cookId, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes]);
  
    return res.status(201).json({ status:201, message: "Meal successfully added", data: { id: result.insertId, name, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes } });
  },

  async updateMeal(req, res) {
    const { mealId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ status:401, message: "Not logged in" });
    }

    const [meal] = await pool.query('SELECT * FROM meal WHERE id = ?', [mealId]);

    if (meal.length === 0) {
      return res.status(404).json({ status:404, message: "Meal not found" });
    }

    if (meal[0].cookId !== req.userId.id) {
      return res.status(403).json({ status:403, message: "Not the owner of the data" });
    }

    const { name, description, dateTime, maxAmountOfParticipants, isActive, isVega, isVegan, isToTakeHome, price, imageUrl, allergenes } = req.body;

    if (!name || !price || !maxAmountOfParticipants) {
      return res.status(400).json({ status:400, message: "Required field is missing" });
    }

    await pool.query('UPDATE meal SET name = ?, description = ?, dateTime = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, allergenes = ? WHERE id = ?', [name, description, dateTime, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes, mealId]);

    return res.status(200).json({ status:200, message: "Meal successfully updated", data: { id: mealId, name, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, allergenes } });
  },

  async deleteMeal(req, res) {
    const { mealId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ status:401, message: "Not logged in" });
    }

    const [meal] = await pool.query('SELECT * FROM meal WHERE id = ?', [mealId]);

    if (meal.length === 0) {
      return res.status(404).json({ status:404, message: "Meal not found" });
    }

    if (meal[0].cookId !== req.userId.id) {
      return res.status(403).json({ status:403, message: "Not the owner of the data" });
    }

    await pool.query('DELETE FROM meal WHERE id= ?', [mealId]);

    return res.status(200).json({ status:200, message: "Meal successfully deleted" });
  },
};