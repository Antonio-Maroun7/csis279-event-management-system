/**
 * Seed script: inserts demo accounts so you can log in with every role.
 * Run with: npm run seed
 * Safe to run many times (existing emails are skipped).
 */
/**
 * Seed script: inserts demo accounts (one per role), categories and venues.
 * Run with: npm run seed
 * Safe to run many times (rows that already exist are skipped).
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

const CATEGORIES = [
  "Technology",
  "Sports",
  "Workshop",
  "Conference",
  "Seminar",
  "Community",
  "Music",
];

const VENUES = [
  {
    name: "Innovation Hall",
    address: "University Campus, Block A",
    city: "Koura",
    max_capacity: 300,
  },
  {
    name: "Sports Center",
    address: "University Campus, Gate 2",
    city: "Koura",
    max_capacity: 500,
  },
  {
    name: "Main Auditorium",
    address: "Downtown, Al Tall Square",
    city: "Tripoli",
    max_capacity: 180,
  },
  {
    name: "Harbor Conference Center",
    address: "Seaside Road, Building 12",
    city: "Beirut",
    max_capacity: 250,
  },
  {
    name: "Open Air Theatre",
    address: "Old Port Street",
    city: "Byblos",
    max_capacity: 400,
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

/**
 * Inserts the demo categories.
 * @param {import("pg").PoolClient} client
 * @returns {Promise<void>}
 */
const seedCategories = async (client) => {
  for (const name of CATEGORIES) {
    await client.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name],
    );
  }
  console.log(`Categories: ${CATEGORIES.length} demo categories ready`);
};

/**
 * Inserts the demo venues (skips a venue that already exists in the same city).
 * @param {import("pg").PoolClient} client
 * @returns {Promise<void>}
 */
const seedVenues = async (client) => {
  for (const venue of VENUES) {
    await client.query(
      `INSERT INTO venues (name, address, city, max_capacity)
       SELECT $1::varchar, $2::varchar, $3::varchar, $4::int
       WHERE NOT EXISTS (
         SELECT 1 FROM venues
         WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($3)
       )`,
      [venue.name, venue.address, venue.city, venue.max_capacity],
    );
  }
  console.log(`Venues: ${VENUES.length} demo venues ready`);
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedUsers(client);
    await seedCategories(client);
    await seedVenues(client);
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
