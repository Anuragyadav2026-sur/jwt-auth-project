
const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  logoutUser
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", logoutUser);

module.exports = router;
