const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");

// Define custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
      stack ? `\n${stack}` : ""
    }`;
  })
);

// Configure daily rotate file for errors
const errorTransport = new winston.transports.DailyRotateFile({
  filename: "error-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: "14d", // Keep logs for 14 days
});

// Configure daily rotate file for combined logs
const combinedTransport = new winston.transports.DailyRotateFile({
  filename: "combined-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: customFormat,
  transports: [
    errorTransport,
    combinedTransport,
    // Also log to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
