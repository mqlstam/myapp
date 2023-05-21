const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');

// Route for user login
router.post('/login', authController.login);

// Route for token validation
router.get('/validate-token', authController.validateToken, (req, res) => {
  // If the token is valid, the middleware will allow the request to reach this point
  // You can add additional logic here if needed
  res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;
