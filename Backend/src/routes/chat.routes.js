const express = require('express');
const authMiddleware = require("../middlewares/auth.middlewares");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

/* POST /api/chat/ */
router.post('/', authMiddleware.authUser,chatController.createChat);
router.get('/', authMiddleware.authUser, chatController.listChats);
router.get('/:chatId/messages', authMiddleware.authUser, chatController.listMessages);



module.exports = router; 