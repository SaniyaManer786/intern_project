const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, 'dmless_secret');
    const user = await User.findById(decoded.id);
    req.user = user;
    next();
};

const recruiterOnly = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ error: 'Recruiter only' });
    }
    next();
};

module.exports = { auth, recruiterOnly };