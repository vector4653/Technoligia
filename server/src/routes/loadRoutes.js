const express = require('express');
const router = express.Router();
const loadController = require('../controllers/loadController');
const bidController = require('../controllers/bidController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken); // Protect all load routes

router.post('/', loadController.createLoad);
router.get('/', loadController.getLoads);

router.post('/:loadId/bids', bidController.placeBid);
router.post('/accept-bid', loadController.acceptBid);
router.post('/:loadId/verify-otp', loadController.verifyOtp);
router.post('/:loadId/accept-job', loadController.acceptJob);

module.exports = router;
