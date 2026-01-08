const express = require('express');
const router = express.Router();
const loadController = require('../controllers/loadController');
const bidController = require('../controllers/bidController');
const { verifyToken } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate Limiter for creating loads: 5 requests per 15 minutes
const createLoadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: { message: "Too many loads created from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict Rate Limiter for OTP Verification: 3 attempts per minute
const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { message: "Too many OTP attempts, please try again after 1 minute" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(verifyToken); // Protect all load routes

// Apply rate limiter specifically to the creation endpoint
router.post('/', createLoadLimiter, loadController.createLoad);
router.get('/', loadController.getLoads);

router.post('/:loadId/bids', bidController.placeBid);
router.post('/accept-bid', loadController.acceptBid);
router.post('/:loadId/verify-otp', otpLimiter, loadController.verifyOtp);
router.post('/:loadId/accept-job', loadController.acceptJob);

module.exports = router;
