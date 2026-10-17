const express = require('express');
const authControllers = require("../controllers/auth.controllers")
const authMiddleware = require("../middlewares/auth.middlewares");
const router = express.Router();


router.post("/register", authControllers.registerUser)
router.post("/login", authControllers.loginUser)
router.get("/me", authMiddleware.authUser, authControllers.getCurrentUser)
router.post("/logout", authControllers.logoutUser)


module.exports = router;