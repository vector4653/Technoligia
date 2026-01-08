const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Server-side validation
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

        // Create Token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                wallet_balance: user.wallet_balance
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password, role, fleetId } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, password and role are required' });
        }

        const validRoles = ['SHIPPER', 'FLEET', 'DRIVER'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user - Password will be hashed by User model hook
        const user = await User.create({
            email,
            password,
            role,
            fleetId: role === 'DRIVER' ? fleetId : null,
            wallet_balance: role === 'SHIPPER' ? 50000 : role === 'FLEET' ? 12500 : 0
        });

        // Create Token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                wallet_balance: user.wallet_balance
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
