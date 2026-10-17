const { Server } = require("socket.io");
const { parseCookie } = require("cookie")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service")
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service")
const chatModel = require("../models/chat.model");

let io;

function initSocketServer(httpServer) {

    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    })

    io.use(async (socket, next) => {

        const cookies = parseCookie(socket.handshake.headers?.cookie || "");

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"));
            return;
        }

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.id);

            if (!user) {
                next(new Error("Authentication error: User not found"));
                return;
            }

            socket.user = user

            next()

        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection", (socket) => {
        socket.join(`user:${socket.user._id}`);

        socket.on("ai-message", async (messagePayload) => {
            const chatId = messagePayload?.chat;
            const content = typeof messagePayload?.content === "string"
                ? messagePayload.content.trim()
                : "";

            try {
                if (!content) {
                    socket.emit("ai-error", {
                        chat: chatId,
                        message: "Enter a message before sending."
                    });
                    return;
                }

                const chat = await chatModel.findOne({
                    _id: chatId,
                    user: socket.user._id
                });

                if (!chat) {
                    socket.emit("ai-error", {
                        chat: chatId,
                        message: "This chat could not be found."
                    });
                    return;
                }

                const [ message, vectors ] = await Promise.all([
                    messageModel.create({
                        chat: chat._id,
                        user: socket.user._id,
                        content,
                        role: "user"
                    }),
                    aiService.generateVector(content),
                ]);

                await createMemory({
                    vectors,
                    messageId: message._id,
                    metadata: {
                        chat: chat._id,
                        user: socket.user._id,
                        text: content
                    }
                });

                const [ memory, chatHistory ] = await Promise.all([
                    queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: { user: socket.user._id }
                    }),
                    messageModel.find({ chat: chat._id })
                        .sort({ createdAt: -1 })
                        .limit(20)
                        .lean()
                        .then(messages => messages.reverse())
                ]);

                const stm = chatHistory.map(item => ({
                    role: item.role,
                    parts: [ { text: item.content } ]
                }));

                const ltm = [{
                    role: "user",
                    parts: [{
                        text: `These are some previous messages from the chat. Use them to generate a response:\n\n${memory.map(item => item.metadata.text).join("\n")}`
                    }]
                }];

                const response = await aiService.generateResponse([ ...ltm, ...stm ]);
                const responseVectors = await aiService.generateVector(response);
                const responseMessage = await messageModel.create({
                    chat: chat._id,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                });

                await createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id,
                    metadata: {
                        chat: chat._id,
                        user: socket.user._id,
                        text: response
                    }
                });

                chat.lastActivity = new Date();
                await chat.save();

                socket.emit("ai-response", {
                    content: response,
                    chat: chat._id
                });
            } catch (error) {
                console.error("AI message failed:", error);
                socket.emit("ai-error", {
                    chat: chatId,
                    message: "The AI couldn't respond right now. Please try again."
                });
            }
        })

    })
}

function disconnectUserSockets(userId) {
    if (io && userId) {
        io.in(`user:${userId}`).disconnectSockets(true);
    }
}

module.exports = initSocketServer;
module.exports.disconnectUserSockets = disconnectUserSockets;