const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");

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
        // console.table(socket.user);
        // console.log("User connected:", socket.user);
        // console.log("New socket connection:", socket.id);

        socket.on("ai-message", async (messagePayload) => {

            console.log(messagePayload)

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const chatHistroy = await messageModel.find({
                chat: messagePayload.chat
            })

            // const chatHistroy = (await messageModel.find({
            //     chat: messagePayload.chat
            // }).sort({ createdAt: -1 }).limit(4).lean()).reverse()


            const response = await aiService.generateResponse(chatHistroy.map(item => {
                return {
                    role: item.role,
                    parts: [ { text: item.content } ]
                }
            }))

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })

            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            })
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        }
    );
    });

}

module.exports = initSocketServer;