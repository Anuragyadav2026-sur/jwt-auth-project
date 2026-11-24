
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Check required environment variables
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32
) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

// Ensure users.json exists
const dataDirectory = path.join(__dirname, "data");
const usersFile = path.join(dataDirectory, "users.json");

fs.mkdirSync(dataDirectory, { recursive: true });

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf8");
}

// Middleware
app.use(express.json());

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://jwt-auth-frontend-dqpf.onrender.com"
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JWT Authentication API is running"
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
