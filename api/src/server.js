/**
 * Entry point: loads environment variables, checks the database connection
 * and starts the HTTP server. Socket.IO will be attached to this same server.
 */
require("dotenv").config();

const http = require("http");
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3000;

/**
 * Starts the server only after PostgreSQL answers.
 * @returns {Promise<void>}
 */
const start = async () => {
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    console.error("Cannot connect to PostgreSQL:", error.message);
    process.exit(1);
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Close the server and the database pool cleanly on Ctrl+C / stop
  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start();
