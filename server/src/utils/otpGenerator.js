const crypto = require('crypto');

exports.generateOTP = () => {
    // Generates a cryptographically strong 6-digit number
    return crypto.randomInt(100000, 1000000).toString();
};