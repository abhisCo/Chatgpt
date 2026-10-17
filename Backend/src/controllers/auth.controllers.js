const userModel = require('../models/user.model');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { disconnectUserSockets } = require('../sockets/socket.server');

const tokenCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
};

function toPublicUser(user) {
    return {
        email: user.email,
        _id: user._id,
        fullName: user.fullName
    };
}

async function registerUser(req,res){

    const {fullName: {firstName, lastName}, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email })

    if(isUserAlreadyExists){
        return res.status(400).json({ message: "User already exists"});
    }
 
    const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullName: {
                firstName, lastName
            },
            email,
            password: hashPassword
        })

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        
        res.cookie("token", token, tokenCookieOptions)

        res.status(201).json({
            message: "User registerd successfully",
            user: toPublicUser(user)
        })
    
}

async function loginUser(req, res){

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user) {
        return res.status(400).json({ message: "Invalid email or password"});
    }

    const isPasswordVaild = await bcrypt.compare(password, user.password);

    if(!isPasswordVaild) {
        return res.status(400).json({ message: "Invalid email or password"});
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, tokenCookieOptions);

    res.status(200).json({
        message: "user logged in successfully",
        user: toPublicUser(user)
    })

}

function getCurrentUser(req, res) {
    res.status(200).json({ user: toPublicUser(req.user) });
}

function logoutUser(req, res) {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            disconnectUserSockets(decoded.id);
        } catch (error) {
            if (!(error instanceof jwt.JsonWebTokenError)) {
                throw error;
            }
        }
    }
    res.clearCookie("token", tokenCookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
}