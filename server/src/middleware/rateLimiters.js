const rateLimit = require('express-rate-limit');

// Strict limiter for authentication routes (login/register)
// Max 10 attempts per 15 minutes window
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again after 15 minutes" }
});

// General limiter for other API routes (load creation, bidding, etc.)
// Max 100 requests per 15 minutes window
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down" }
});

module.exports = { authLimiter, apiLimiter };
