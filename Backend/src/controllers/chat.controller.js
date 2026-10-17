const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const mongoose = require('mongoose');

async function createChat(req, res) {
    
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const user = req.user;

    if (!title) {
        return res.status(400).json({ message: 'A chat title is required' });
    }

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }
    });

}

async function listChats(req, res) {
    const chats = await chatModel.find({ user: req.user._id })
        .sort({ lastActivity: -1, createdAt: -1 })
        .select('_id title lastActivity createdAt')
        .lean();

    res.status(200).json({ chats });
}

async function listMessages(req, res) {
    if (!mongoose.isValidObjectId(req.params.chatId)) {
        return res.status(404).json({ message: 'Chat not found' });
    }

    const chat = await chatModel.findOne({
        _id: req.params.chatId,
        user: req.user._id
    }).select('_id').lean();

    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await messageModel.find({ chat: chat._id })
        .sort({ createdAt: 1 })
        .select('_id chat content role createdAt')
        .lean();

    res.status(200).json({ messages });
}

module.exports = {
    createChat,
    listChats,
    listMessages
};