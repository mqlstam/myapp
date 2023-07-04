const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');
const mealController = require('../controllers/meal.controller');

// UC-301 Toevoegen van maaltijden
router.post('', authController.validateToken, mealController.addMeal);

module.exports = router;