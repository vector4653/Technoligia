const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET is not defined.');
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access Denied' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
