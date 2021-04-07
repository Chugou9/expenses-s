const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('auth-token');

    if (!token) return res.status(400).send('Access Denied');

    try {
        const isVerified = jwt.verify(token, process.env.TOKEN_SECRET);

        req.user = isVerified;
        next();
    } catch (error) {
        req.status(400).send('Invalid token');
    }
}