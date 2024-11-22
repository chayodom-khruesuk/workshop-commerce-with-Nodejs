const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).send({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Token is invalid or expired.' });
        }

        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        next();
    });
};

module.exports = authenticateJWT;