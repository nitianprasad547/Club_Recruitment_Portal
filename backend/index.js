const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => {
    try {
      return new URL(origin.trim()).origin;
    } catch {
      return "";
    }
  })
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://127.0.0.1:3000", "http://localhost:3000");
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      // Automatically permit any Vercel deployment (preview or production)
      if (origin && (origin.endsWith(".vercel.app") || origin.includes("vercel.app"))) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== "production") {
        try {
          const { protocol, hostname } = new URL(origin);
          if (protocol === "http:" && ["localhost", "127.0.0.1"].includes(hostname)) {
            return callback(null, true);
          }
        } catch {
          // Reject malformed origins
        }
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Guard auth routes if database is offline
app.use("/api/auth", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database is offline. Run 'brew services start mongodb-community' in your terminal to start your local database.",
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: isDbConnected
      ? "Backend and Database are connected"
      : "Backend is running (Database is connecting or offline)",
    database: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 5001;

async function attemptDbConnection() {
  try {
    await connectDB();
  } catch (error) {
    console.warn(`[Database]: ${error.message}`);
    // Auto-retry in background every 10 seconds until DB becomes available
    setTimeout(attemptDbConnection, 10000);
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
    attemptDbConnection();
  });
}

startServer();
