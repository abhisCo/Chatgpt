const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

/*async function authUser(req, res, next) {    
    const { token } = req.cookies;

    if(!token){
        return res.status(401).json({ message: 'Unauthorized'});
    }
    
    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id)

        req.user = user;
        
        next()

    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });

    }
}*/


async function authUser(req, res, next) {
    console.log("Cookies:", req.cookies);

    const { token } = req.cookies || {};

    console.log("Token:", token);

    if (!token) {
        return res.status(401).json({
            message: 'Token missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log("Decoded:", decoded);

        const user = await userModel.findById(decoded.id);

        // console.log("User:", user);

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log("JWT Error:", err.message);

        return res.status(401).json({
            message: 'Invalid token'
        });
    }
}



module.exports = {
    authUser
}