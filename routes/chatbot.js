const express = require("express");
const router = express.Router();
const { getChatbotResponse } = require("../controllers/ChatBotController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/chat", authMiddleware, getChatbotResponse);

module.exports = router;
