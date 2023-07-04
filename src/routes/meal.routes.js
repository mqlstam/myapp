const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');
const mealController = require('../controllers/meal.controller');
// Add a meal
router.post('', authController.validateToken, mealController.addMeal);

// Update a meal
router.put('/:mealId', authController.validateToken, mealController.updateMeal);

// Get all meals
router.get('', mealController.getAllMeals);

// Get a meal by ID
router.get('/:mealId', mealController.getMealById);

// Delete a meal
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

module.exports = router;