require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loads', require('./src/routes/loadRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send('FreightSync API is running');
});

// Database & Server Start
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('Error: ' + err));
