/**
 * Seed script: inserts demo accounts (one per role), categories, venues, events
 * and two demo registrations with tickets.
 * Run with: npm run seed
 * Safe to run many times (rows that already exist are skipped).
 */
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
const {
  generateTicketCode,
} = require("../src/features/registrations/ticketCode");

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

// days_from_now keeps the demo events in the future every time you run the seed
const EVENTS = [
  {
    title: "AI & The Future of Software",
    description:
      "A practical conference exploring AI-assisted development, modern software architecture and the future of engineering teams.",
    category: "Technology",
    venue: "Innovation Hall",
    days_from_now: 10,
    start: "10:00",
    end: "13:00",
    capacity: 100,
    price: 10,
    status: "published",
  },
  {
    title: "University Futsal Tournament",
    description:
      "Teams from every faculty compete in a one-day futsal tournament. Supporters welcome!",
    category: "Sports",
    venue: "Sports Center",
    days_from_now: 14,
    start: "17:30",
    end: "21:00",
    capacity: 200,
    price: 0,
    status: "published",
  },
  {
    title: "Modern Web Development Bootcamp",
    description:
      "A full-day hands-on workshop on React, Express and PostgreSQL. Bring your laptop.",
    category: "Workshop",
    venue: "Main Auditorium",
    days_from_now: 20,
    start: "09:00",
    end: "16:00",
    capacity: 60,
    price: 15,
    status: "published",
  },
  {
    title: "Community Clean-Up Day",
    description:
      "Join volunteers to clean the old port area. Gloves and bags are provided.",
    category: "Community",
    venue: "Open Air Theatre",
    days_from_now: 25,
    start: "08:00",
    end: "12:00",
    capacity: 150,
    price: 0,
    status: "published",
  },
  {
    title: "Acoustic Night",
    description: "Student bands play unplugged under the stars.",
    category: "Music",
    venue: "Open Air Theatre",
    days_from_now: 30,
    start: "19:00",
    end: "22:00",
    capacity: 300,
    price: 20,
    status: "published",
  },
  {
    title: "Spring Tech Meetup",
    description: "Lightning talks from students and local startups.",
    category: "Conference",
    venue: "Harbor Conference Center",
    days_from_now: 40,
    start: "18:00",
    end: "20:00",
    capacity: 50,
    price: 0,
    status: "draft",
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

/**
 * Inserts the demo events, all created by the demo organizer
 * (skips an event whose title already exists).
 * @param {import("pg").PoolClient} client
 * @returns {Promise<void>}
 */
const seedEvents = async (client) => {
  for (const event of EVENTS) {
    await client.query(
      `INSERT INTO events
         (organizer_id, venue_id, category_id, title, description,
          start_time, end_time, capacity, price, status)
       SELECT u.id, v.id, c.id, $1::varchar, $2::text,
              (CURRENT_DATE + $3::int) + $4::time,
              (CURRENT_DATE + $3::int) + $5::time,
              $6::int, $7::numeric, $8::varchar
       FROM users u, venues v, categories c
       WHERE u.email = 'organizer@eventflow.com'
         AND v.name = $9 AND c.name = $10
         AND NOT EXISTS (SELECT 1 FROM events WHERE title = $1)`,
      [
        event.title,
        event.description,
        event.days_from_now,
        event.start,
        event.end,
        event.capacity,
        event.price,
        event.status,
        event.venue,
        event.category,
      ],
    );
  }
  console.log(`Events: ${EVENTS.length} demo events ready`);
};

/**
 * Registers the demo attendee to the first two published events (each with a ticket)
 * and checks in the first ticket. Skips an event the attendee is already registered
 * to, so running the seed again never creates duplicates.
 * @param {import("pg").PoolClient} client
 * @returns {Promise<void>}
 */
const seedRegistrations = async (client) => {
  const titles = EVENTS.filter((e) => e.status === "published")
    .slice(0, 2)
    .map((e) => e.title);

  for (const [index, title] of titles.entries()) {
    const { rows } = await client.query(
      `INSERT INTO registrations (event_id, user_id)
       SELECT e.id, u.id
       FROM events e, users u
       WHERE e.title = $1 AND u.email = 'attendee@eventflow.com'
         AND NOT EXISTS (
           SELECT 1 FROM registrations r
           WHERE r.event_id = e.id AND r.user_id = u.id AND r.status = 'confirmed'
         )
       RETURNING id`,
      [title],
    );
    if (rows.length === 0) continue;

    let ticketCreated = false;
    while (!ticketCreated) {
      const { rowCount } = await client.query(
        `INSERT INTO tickets (registration_id, ticket_code)
         VALUES ($1, $2)
         ON CONFLICT (ticket_code) DO NOTHING`,
        [rows[0].id, generateTicketCode()],
      );
      ticketCreated = rowCount > 0;
    }

    // the first ticket of the demo is already checked in
    if (index === 0) {
      await client.query(
        "UPDATE tickets SET checked_in_at = NOW() WHERE registration_id = $1",
        [rows[0].id],
      );
    }
  }
  console.log("Registrations: demo attendee registrations ready (2 events)");
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedUsers(client);
    await seedCategories(client);
    await seedVenues(client);
    await seedEvents(client);
    await seedRegistrations(client);
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
