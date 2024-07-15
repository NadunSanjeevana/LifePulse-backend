const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserDetails,
} = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update", authMiddleware, updateUserDetails);
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
