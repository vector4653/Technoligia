require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // Added cookieParser import
const { authLimiter, apiLimiter } = require('./src/middleware/rateLimiters');
const loadRoutes = require('./src/routes/loadRoutes'); // Kept loadRoutes import here as it's not moved in the example

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Adds security headers, disable CSP to allow inline scripts

// Debug Logging
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// CORS Configuration (Restrict to Client URL)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow only frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global Rate Limiting for API routes
app.use('/api/', apiLimiter);

// Strict Rate Limiting for Auth routes
app.use('/api/auth', authLimiter);

// Limit payload size to 10kb to prevent DDoS via large JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser()); // Added cookieParser middleware

// Serves static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./src/routes/authRoutes'); // Moved authRoutes import here
const userRoutes = require('./src/routes/userRoutes'); // Moved userRoutes import here

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loads', loadRoutes);

// Test Route
app.get('/api/health', (req, res) => {
    res.send('FreightSync API is running');
});

// Serve Static Assets in Production
app.use(express.static(path.join(__dirname, 'public')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Database & Server Start
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('Error: ' + err));
