
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const generateToken = require("../config/jwt");

const USERS_FILE = path.join(__dirname, "../data/users.json");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 1000
};

// Read users from JSON file
const readUsers = async () => {
  const data = await fs.readFile(USERS_FILE, "utf8");
  return JSON.parse(data);
};

// Save users to JSON file
const writeUsers = async (users) => {
  const tempFile = USERS_FILE + ".tmp";

  await fs.writeFile(
    tempFile,
    JSON.stringify(users, null, 2),
    "utf8"
  );

  await fs.rename(tempFile, USERS_FILE);
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    if (typeof name !== "string" || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid name"
      });
    }

    if (typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters"
      });
    }

    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(
      (user) => user.email === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    };

    // Save user in JSON file
    users.push(newUser);

    await writeUsers(users);

    // Generate JWT
    const token = generateToken(newUser.id);

    // Store token in HttpOnly cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const users = await readUsers();

    // Find user
    const user = users.find(
      (user) => user.email === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Set cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// GET CURRENT LOGGED-IN USER
const getMe = async (req, res) => {
  try {
    const users = await readUsers();

    const user = users.find(
      (user) => user.id === req.user.userId
    );

    if (!user) {
      res.clearCookie("token", COOKIE_OPTIONS);

      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// LOGOUT USER
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
