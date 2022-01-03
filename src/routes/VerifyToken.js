const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    if (!req?.cookies || !req.cookies?.secureCookie) {
        return res.status(400).send('Access Denied');
    }
    const token = req.cookies.secureCookie.data;
    
    try {
        const isVerified = jwt.verify(token, process.env.TOKEN_SECRET);

        req.user = isVerified;
        console.log('[*** Verified ***]');
        next();
    } catch (error) {
        req.status(400).send('Invalid token');
    }
}