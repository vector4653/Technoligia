const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// All routes here are protected
router.get('/me', verifyToken, userController.getProfile);
router.get('/my-active-load', verifyToken, userController.getMyActiveLoad);

module.exports = router;