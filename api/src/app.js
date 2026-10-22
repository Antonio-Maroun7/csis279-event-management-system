/**
 * Builds the Express application: global middleware, feature routes,
 * 404 handler and the central error handler.
 * The server itself is started in server.js (so tests can import the app).
 */
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./features/health/health.routes");

const notFound = require("./shared/middleware/notFound");
const errorHandler = require("./shared/middleware/errorhandler");
const authRoutes = require("./features/auth/auth.routes");
const userRoutes = require("./features/users/user.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Event Management System API is running" });
});

// Feature routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
