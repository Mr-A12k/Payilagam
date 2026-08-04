const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Import routes
const routes = require("./routes");

const app = express();

// Global Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images/resources to be served across origins
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Serve static resources
const storagePath =
  process.env.RESOURCE_STORAGE_PATH || path.join(__dirname, "../resources");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}
app.use("/resources", express.static(storagePath));

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// API Routes
app.use("/api", routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
