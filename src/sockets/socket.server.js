const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

function initSocketServer(httpServer) {

    const io = new Server(httpServer, {});

    io.use(async (socket, next) => {

        const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "");

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"));
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.id);

            socket.user = user

            next()
            
        }catch(err) {
            next(new Error ("Authentication error: Invalid token"));
        }

        // console.log("Socket connection cookies:", cookies);
    })

    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        }
    );
    });

}

module.exports = initSocketServer;