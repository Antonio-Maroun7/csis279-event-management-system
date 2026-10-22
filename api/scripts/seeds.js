/**
 * Seed script: inserts demo accounts so you can log in with every role.
 * Run with: npm run seed
 * Safe to run many times (existing emails are skipped).
 */
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

const USERS = [
  {
    first_name: "System",
    last_name: "Admin",
    email: "admin@eventflow.com",
    password: "Admin12345",
    role: "admin",
  },
  {
    first_name: "Antonio",
    last_name: "Maroun",
    email: "organizer@eventflow.com",
    password: "Organizer123",
    role: "organizer",
  },
  {
    first_name: "Maya",
    last_name: "Khoury",
    email: "attendee@eventflow.com",
    password: "Attendee123",
    role: "attendee",
  },
];

/**
 * Inserts the demo users.
 * @param {import("pg").PoolClient} client
 * @returns {Promise<void>}
 */
const seedUsers = async (client) => {
  for (const user of USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [user.first_name, user.last_name, user.email, passwordHash, user.role],
    );
  }
  console.log(`Users: ${USERS.length} demo accounts ready`);
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedUsers(client);
    await client.query("COMMIT");
    console.log("Seed completed");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
