# EventFlow – Event Management System

CSIS279 (Advances in Computer Science) midterm implementation, University of Balamand. Author: Antonio Maroun.

## Table of Contents

1. [Overview](#1-overview)
2. [Midterm Scope](#2-midterm-scope)
3. [Implemented Features](#3-implemented-features)
4. [Final Project – Planned Continuation](#4-final-project--planned-continuation)
5. [Technology Stack](#5-technology-stack)
6. [Project Structure](#6-project-structure)
7. [Backend Architecture](#7-backend-architecture)
8. [Database Schema](#8-database-schema)
9. [REST API](#9-rest-api)
10. [Environment Variables](#10-environment-variables)
11. [Installation & Setup](#11-installation--setup)
12. [Running the Application](#12-running-the-application)
13. [Testing](#13-testing)
14. [Validation & Security Measures](#14-validation--security-measures)
15. [Midterm Demo Flow](#15-midterm-demo-flow)
16. [Final Project Roadmap](#16-final-project-roadmap)

---

## 1. Overview

EventFlow is a full-stack web application for publishing and managing events. Three kinds of users share one system:

| Role | What they do |
|---|---|
| **Attendee** | Creates an account, browses published events (search, category and city filters, pagination) and opens event details. |
| **Organizer** | Creates events, saves drafts, publishes, edits, cancels and deletes drafts from a dashboard with statistics. An organizer manages **only their own** events. |
| **Admin** | Manages users (roles, deletion, 2FA reset), categories and venues, and can manage every event. |

Main technologies: React 19 + Vite + React Router on the front end, Node.js + Express 5 on the back end, PostgreSQL for storage, JWT + bcrypt for authentication and TOTP two-factor authentication.

## 2. Midterm Scope

The project is built incrementally. Following the instructor's direction, the full proposal was not required for the midterm. This repository contains the functionality completed for the midterm evaluation; the remaining modules continue in the final project.

Completed for the midterm:

- Authentication (register, login with JWT, logout) and role-based access (attendee / organizer / admin).
- TOTP two-factor authentication with QR code, backup codes and admin reset.
- User profile, change password and admin user management.
- Categories and venues management.
- Events: public browsing, details, organizer dashboard, event form (create / edit), publish, cancel, delete drafts, venue double-booking prevention and ownership rules.
- Registrations and tickets: **backend API only** (no user interface yet).

## 3. Implemented Features

### Authentication & 2FA
- Register (always creates an `attendee`), login, client-side logout, "remember me" (token stored in `localStorage` or `sessionStorage`).
- Route guards in React (`GuestRoute`, `ProtectedRoute` with roles, `RoleLayout`) and the same role checks on the backend.
- TOTP 2FA (Google Authenticator, Microsoft Authenticator, Authy…):
  - setup with a QR code, confirmation with a 6-digit code to enable it;
  - when 2FA is on, login returns a short-lived (5 minutes) `temp_token`; the second step (`/api/auth/2fa/verify`) returns the real JWT;
  - 10 one-time backup codes (stored as hashes), regeneration, disable (needs a code);
  - an admin can reset the 2FA of a user who lost their phone;
  - the 2FA secret is encrypted in the database with AES-256-GCM.

### Users
- View and edit own profile, change password (current password required).
- Admin: user list with search, role filter and pagination, role change, delete (blocked when the user has events or registrations), reset 2FA. An admin cannot change or delete their own account.

### Categories
- Public list. Admin: create, rename, delete (delete is blocked while events use the category).

### Venues
- Public list. Admin: create, edit, delete. A venue name is unique per city (case-insensitive), capacity must be between 1 and 100000, the capacity cannot be lowered under an active event's capacity, and delete is blocked while events use the venue.

### Events (attendee side)
- Browse published events that have not ended, with search, category filter, city filter and server-side pagination.
- Event details: category, venue, organizer, price, seats taken / capacity with a progress bar, cancelled / ended notices, share link.
- Pages are available **after login** (the API endpoints are public).

### Organizer dashboard & event management
- Dashboard statistics (total events, confirmed registrations, upcoming events, cancelled events) and a searchable, filterable, paginated table of the organizer's events.
- Event form (create / edit) with a publish checklist: save draft, publish, or save changes.
- Publish a draft, cancel an event (confirmation modal), delete drafts only.
- Rules enforced by the API: capacity ≤ venue capacity, start time in the future, end after start, **a venue cannot be booked by two events at overlapping times (409)**, capacity cannot go below the seats already taken, an organizer can only change their own events (403), drafts are invisible to other users (404).

### Admin pages
- Users, Venues and Categories pages (`/admin/users`, `/admin/venues`, `/admin/categories`) with tables, filters, forms in modals and confirmation dialogs.

### Registrations & tickets (backend API only)
Implemented in `api/src/features/registrations`, without a frontend in this version:
- register to an event: one transaction with `SELECT … FOR UPDATE` on the event row so the last seat cannot be taken twice; a ticket with a unique code (`EVT-XXXXXXX`) is created;
- cancel a registration (the seat becomes free), list "my registrations" (upcoming / past / cancelled), get my registration for an event;
- attendee list with statistics for the event owner or an admin, and check-in by ticket code.

## 4. Final Project – Planned Continuation

These features remain part of the approved project scope and are planned for the final-project development phase.

| Feature | Current preparation |
|---|---|
| Registration interface (Register button on Event Details, My Tickets page) | Backend endpoints already exist and are documented below. |
| Electronic ticket view and the Attendees & Check-in page | `tickets` table and check-in endpoint already exist. |
| Notifications (API + UI) | The `notifications` table already exists in the database. |
| Real-time seat updates with Socket.IO | The `socket.io` package is installed in `api/package.json` but not wired yet. |
| Combined Admin Dashboard overview (view 12) | Users, venues and categories pages already exist separately. |
| Automated tests | Not written yet. |

## 5. Technology Stack

| Area | Technology |
|---|---|
| Front end | React 19, Vite 8, React Router 7 (`react-router-dom`), plain CSS with our own reusable components (no Bootstrap) |
| Front-end tooling | Oxlint |
| Back end | Node.js, Express 5, `cors`, `dotenv` |
| Database | PostgreSQL, `pg` (node-postgres) |
| Authentication | JWT (`jsonwebtoken`), `bcrypt` |
| Validation | `express-validator` |
| Two-factor authentication | `speakeasy` (TOTP), `qrcode`, AES-256-GCM through Node `crypto` |
| Real time | `socket.io` – installed, planned for the final project |
| Development | `nodemon` |

## 6. Project Structure

```
csis279-event-management-system/
├── api/
│   ├── scripts/seed.js                 # demo data
│   ├── src/
│   │   ├── app.js                      # Express app, routes, error handling
│   │   ├── server.js                   # starts the server after the DB answers
│   │   ├── config/db.js                # PostgreSQL pool
│   │   ├── features/
│   │   │   ├── auth/  twoFactor/  users/  categories/  venues/  events/  registrations/  health/
│   │   │   └── <feature>/ entity · mapper · dto · repository · service · controller · validator · routes
│   │   └── shared/
│   │       ├── errors/AppError.js
│   │       ├── middleware/             # authenticate, optionalAuthenticate, authorize, validate, notFound, errorhandler
│   │       ├── utils/                  # jwt.js, encryption.js
│   │       └── validators/common.validator.js
│   └── .env.example
├── app/
│   ├── src/
│   │   ├── main.jsx · App.jsx
│   │   ├── features/<feature>/         # auth, users, twoFactor, categories, venues, events
│   │   │   ├── services/               # API calls of the feature
│   │   │   ├── components/             # feature components
│   │   │   ├── views/                  # pages
│   │   │   └── *Validation.js          # client-side validation rules
│   │   └── shared/
│   │       ├── api/                    # apiFetch, handleResponse, ApiError
│   │       ├── components/ (ui, layout, routing)
│   │       ├── hooks/                  # useForm, useFetch, useDebounce
│   │       ├── config/roles.js · styles/global.css · utils/ · views/
│   └── .env.example
└── database/
    ├── event_management_system.sql     # schema dump
    └── migrations/                     # 001_two_factor_backup_codes.sql, 002_venues_unique_name_city.sql
```

Back-end layers of every feature:

| File | Responsibility |
|---|---|
| `*.entity.js` | One database row (snake_case columns). |
| `*.mapper.js` / `*.dto.js` | Entity → response DTO (secrets are never copied) and request → fields. |
| `*.repository.js` | The only layer that writes SQL (parameterized queries). |
| `*.service.js` | Business rules, throws `AppError`. |
| `*.controller.js` | Reads the request, calls the service, sends JSON. |
| `*.validator.js` | `express-validator` rules, ending with the shared `validate` middleware. |
| `*.routes.js` | URL → middleware → controller. |

Front-end flow: **View → hooks (`useForm`, `useFetch`, `useDebounce`) → feature service → `apiFetch` → API**. Components never call `fetch` directly.

## 7. Backend Architecture

```
Request
  → Route
  → validators (express-validator) + validate middleware
  → authenticate / authorize          (protected routes)
  → Controller
  → Service      (business rules, throws AppError)
  → Repository   (parameterized SQL)
  → PostgreSQL
  → JSON response
```

- Each layer has one job: routes map URLs, controllers handle HTTP, services hold rules, repositories hold SQL.
- Services throw `AppError` (400, 401, 403, 404, 409). One central `errorhandler` middleware turns every error into `{ "message": "...", "errors": [...] }`. PostgreSQL violations (unique, foreign key, check…) are mapped to 409 / 400, and unexpected errors return a generic 500 without internal details.
- The shared `validate` middleware returns `400 { message: "Validation failed", errors: [{ field, message }] }`.
- Registration uses a database transaction that locks the event row with `SELECT … FOR UPDATE`, so two people can never take the last seat at the same time.

## 8. Database Schema

The database is PostgreSQL. Every foreign key uses `ON DELETE RESTRICT`, except the backup codes (`CASCADE`).

| Table | Purpose | Key columns | Constraints |
|---|---|---|---|
| `users` | Accounts | `id`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `two_factor_secret`, `two_factor_enabled` | `email` unique; `role` in attendee / organizer / admin; 2FA cannot be enabled without a secret |
| `categories` | Event categories | `id`, `name` | `name` unique |
| `venues` | Places | `id`, `name`, `address`, `city`, `max_capacity` | `max_capacity > 0`; unique `(LOWER(name), LOWER(city))` (migration 002) |
| `events` | Events | `id`, `organizer_id`, `venue_id`, `category_id`, `title`, `description`, `start_time`, `end_time`, `capacity`, `price`, `status` | FK to `users`, `venues`, `categories`; `end_time > start_time`; `capacity > 0`; `price >= 0`; status in draft / published / cancelled / completed; indexes on category, organizer, start time, status, venue |
| `registrations` | A user's seat in an event | `id`, `event_id`, `user_id`, `status`, `registered_at`, `cancelled_at` | FK to `events`, `users`; status in confirmed / cancelled; **unique `(event_id, user_id)` while confirmed** |
| `tickets` | Electronic ticket of a registration | `id`, `registration_id`, `ticket_code`, `checked_in_at` | `registration_id` unique (1:1); `ticket_code` unique |
| `notifications` | Messages for users | `id`, `user_id`, `event_id`, `type`, `message`, `is_read` | FK to `users`, `events`; type in updated / cancelled / reminder |
| `two_factor_backup_codes` | One-time 2FA backup codes (SHA-256 hashes) | `id`, `user_id`, `code_hash`, `used_at` | FK to `users` with `ON DELETE CASCADE` (migration 001) |

Relationships: a user (organizer) has many events; a category and a venue have many events; an event has many registrations; a registration has exactly one ticket. Seats taken are not stored: they are counted from confirmed registrations.

Usage in this version:

| Tables | Used by |
|---|---|
| `users`, `categories`, `venues`, `events`, `two_factor_backup_codes` | The midterm user interface and the API |
| `registrations`, `tickets` | The backend API only (no user interface yet). The seed inserts two demo registrations. |
| `notifications` | Not used yet (planned for the final) |

SQL files, in the order to run them:

1. `database/event_management_system.sql` – schema (no data).
2. `database/migrations/001_two_factor_backup_codes.sql` – required, the dump does not contain this table.
3. `database/migrations/002_venues_unique_name_city.sql` – required, adds the unique venue index.

## 9. REST API

Base URL: `http://localhost:3000/api`. Protected routes need the header `Authorization: Bearer <token>`. Lists use `?page=&limit=` (limit 1–100) and return `total`, `page`, `limit`, `total_pages`.

### Health
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/health` | – | – | API and database status |

### Authentication & two-factor
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | `/auth/register` | – | – | Create an attendee account and return a JWT |
| POST | `/auth/login` | – | – | Login; when 2FA is on returns `requires_two_factor` and a `temp_token` |
| POST | `/auth/2fa/verify` | `temp_token` in body | – | Second login step (6-digit code or backup code) |
| GET | `/auth/2fa/status` | JWT | any | 2FA on/off and backup codes left |
| POST | `/auth/2fa/setup` | JWT | any | Create a secret and a QR code |
| POST | `/auth/2fa/enable` | JWT | any | Confirm a code, enable 2FA, return backup codes |
| POST | `/auth/2fa/disable` | JWT | any | Disable 2FA with an app code or a backup code |
| POST | `/auth/2fa/backup-codes` | JWT | any | Create new backup codes |

### Users
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/users/me` | JWT | any | Own profile |
| PUT | `/users/me` | JWT | any | Edit first and last name |
| PATCH | `/users/me/password` | JWT | any | Change password |
| GET | `/users?search=&role=&page=&limit=` | JWT | admin | User list with counts per role |
| GET | `/users/:id` | JWT | admin | One user |
| PATCH | `/users/:id/role` | JWT | admin | Change a role |
| DELETE | `/users/:id` | JWT | admin | Delete a user |
| DELETE | `/users/:id/two-factor` | JWT | admin | Reset a user's 2FA |

### Categories
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/categories?search=` | – | – | List categories |
| GET | `/categories/:id` | – | – | One category |
| POST | `/categories` | JWT | admin | Create |
| PUT | `/categories/:id` | JWT | admin | Rename |
| DELETE | `/categories/:id` | JWT | admin | Delete (409 if used by events) |

### Venues
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/venues?search=&city=` | – | – | List venues |
| GET | `/venues/:id` | – | – | One venue |
| POST | `/venues` | JWT | admin | Create |
| PUT | `/venues/:id` | JWT | admin | Edit |
| DELETE | `/venues/:id` | JWT | admin | Delete (409 if used by events) |

### Events
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| GET | `/events?search=&category_id=&city=&page=&limit=` | – | – | Published events that have not ended |
| GET | `/events/manage?status=&search=&page=&limit=` | JWT | organizer, admin | Own events (all events for admin) + dashboard statistics |
| GET | `/events/:id` | optional | – | Event details (a draft is visible only to its owner and admins) |
| POST | `/events` | JWT | organizer, admin | Create (`status`: `draft` or `published`) |
| PUT | `/events/:id` | JWT | organizer (owner), admin | Edit |
| PATCH | `/events/:id/publish` | JWT | organizer (owner), admin | Publish a draft |
| PATCH | `/events/:id/cancel` | JWT | organizer (owner), admin | Cancel |
| DELETE | `/events/:id` | JWT | organizer (owner), admin | Delete a draft |

### Registrations & tickets – Backend ready, frontend planned for the final
| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | `/events/:eventId/register` | JWT | attendee | Register and create the ticket |
| GET | `/events/:eventId/my-registration` | JWT | any | My confirmed registration for the event (or `null`) |
| GET | `/events/:eventId/attendees?search=&checked_in=&page=&limit=` | JWT | organizer (owner), admin | Attendees with statistics |
| POST | `/events/:eventId/check-in` | JWT | organizer (owner), admin | Check in with `{ "ticket_code": "EVT-XXXXXXX" }` |
| GET | `/registrations/me?status=upcoming\|past\|cancelled&page=&limit=` | JWT | attendee | My registrations |
| PATCH | `/registrations/:id/cancel` | JWT | attendee (own) | Cancel my registration |

### Examples

`POST /api/auth/login`

```json
{ "email": "organizer@eventflow.com", "password": "Organizer123" }
```

Response `200`:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": 3,
    "first_name": "Antonio",
    "last_name": "Maroun",
    "email": "organizer@eventflow.com",
    "role": "organizer",
    "two_factor_enabled": false,
    "created_at": "<timestamp>"
  }
}
```

With 2FA enabled the response is `{ "message": "Enter your two-factor code to continue", "requires_two_factor": true, "temp_token": "<token>" }`, followed by `POST /api/auth/2fa/verify` with `{ "temp_token": "...", "code": "123456" }`.

`GET /api/events?page=1&limit=2`

```json
{
  "events": [
    {
      "id": 1,
      "title": "AI & The Future of Software",
      "start_time": "2026-11-11T08:00:00.000Z",
      "end_time": "2026-11-11T11:00:00.000Z",
      "capacity": 100,
      "price": 10,
      "status": "published",
      "seats_taken": 0,
      "seats_left": 100,
      "is_past": false,
      "category": { "id": 1, "name": "Technology" },
      "venue": { "id": 1, "name": "Innovation Hall", "city": "Koura", "max_capacity": 300 },
      "organizer": { "id": 3, "first_name": "Antonio", "last_name": "Maroun" }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 2,
  "total_pages": 3
}
```

(Some fields are omitted for brevity; the exact values depend on your data.)

Error format: `{ "message": "Validation failed", "errors": [{ "field": "email", "message": "email must be a valid email" }] }`.

## 10. Environment Variables

Copy the example files and fill in your own values (never commit the real `.env` files):

```bash
cp .env.example .env          # macOS / Linux / Git Bash
copy .env.example .env        # Windows (cmd / PowerShell)
```

**`api/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | `development` |
| `CLIENT_URL` | Front-end origin allowed by CORS (default `http://localhost:5173`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection (`DB_NAME=event_management_system`) |
| `JWT_SECRET` | Long random string used to sign tokens (**required**, the server will not start without it) |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1d` |
| `TWO_FACTOR_ENCRYPTION_KEY` | Long random string that encrypts the 2FA secrets. Do not change it after users enabled 2FA. |

Generate a random value with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**`app/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the API, `http://localhost:3000/api` (must match `PORT`) |

## 11. Installation & Setup

**Prerequisites:** Node.js (a current LTS version; the project was developed with Node 24), npm, PostgreSQL.

1. Clone the repository:
   ```bash
   git clone https://github.com/Antonio-Maroun7/csis279-event-management-system.git
   cd csis279-event-management-system
   ```
2. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE event_management_system;"
   ```
3. Restore the schema. The dump is a plain SQL file that contains `psql` commands, so restore it with `psql`:
   ```bash
   psql -U postgres -d event_management_system -f database/event_management_system.sql
   ```
4. Run the migrations, in this order:
   ```bash
   psql -U postgres -d event_management_system -f database/migrations/001_two_factor_backup_codes.sql
   psql -U postgres -d event_management_system -f database/migrations/002_venues_unique_name_city.sql
   ```
5. Create the two `.env` files (see section 10), then install the dependencies:
   ```bash
   cd api
   npm install
   cd ../app
   npm install
   ```
6. Insert the demo data (every run resets the three demo accounts below to their documented password and role; the other rows are only inserted when missing):
   ```bash
   cd ../api
   npm run seed
   ```

## 12. Running the Application

Open two terminals:

| Terminal | Commands | Address |
|---|---|---|
| API | `cd api` then `npm run dev` (or `npm start`) | `http://localhost:3000` (port from `api/.env`) |
| Front end | `cd app` then `npm run dev` | `http://localhost:5173` |

Quick check that the API works: open `http://localhost:3000/api/health`. It must answer `{"status":"ok","database":"connected",…}`.

Front-end scripts: `npm run build` (production build) and `npm run lint` (Oxlint).

## 13. Testing

**There are no automated tests yet** (`npm test` in `api` is the default placeholder). The application is tested manually.

**Demo accounts** created or reset by `npm run seed` (running the seed again restores these three accounts to the password and role shown below):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@eventflow.com` | `Admin12345` |
| Organizer | `organizer@eventflow.com` | `Organizer123` |
| Attendee | `attendee@eventflow.com` | `Attendee123` |

The seed also creates 7 categories, 5 venues, 6 events (5 published and 1 draft, dated in the future) and two demo registrations for the attendee.

**Manual browser test path:** sign in as each role and follow the [demo flow](#15-midterm-demo-flow) below.

**API testing with Postman / Thunder Client:**

1. `POST http://localhost:3000/api/auth/login` with `{"email":"admin@eventflow.com","password":"Admin12345"}` and copy the `token`.
2. Add the header `Authorization: Bearer <token>` and call, for example:
   - `GET /api/users?role=organizer&page=1&limit=5` → 200
   - `POST /api/venues` with an invalid body → 400 with a field list
   - `GET /api/users` without a token → 401, with an organizer token → 403
3. Log in as the organizer and try to edit another organizer's event → 403.

## 14. Validation & Security Measures

- **Passwords:** hashed with bcrypt; 8–72 characters with a letter and a number.
- **JWT:** access token with `id`, `email`, `role` and `type: "access"`, expiring after `JWT_EXPIRES_IN`. The 2FA `temp_token` has `type: "2fa"`, lives 5 minutes and cannot call protected routes.
- **Role-based access on the backend** (`authenticate` + `authorize`) for every protected route, plus ownership checks for events (organizer vs admin). The React guards only improve the user experience.
- **No secrets in responses:** `password_hash` and `two_factor_secret` are never returned (DTO mappers and explicit column lists).
- **Two-factor authentication:** secret encrypted with AES-256-GCM; backup codes stored as SHA-256 hashes and usable once.
- **Input validation:** `express-validator` for bodies, params and query strings (types, lengths, ranges, ISO dates, pagination limits); the front end applies the same rules before sending.
- **SQL injection:** every query is parameterized.
- **Error handling:** `AppError` + a central error handler. No stack traces or SQL details are sent to the client.
- **Database integrity:** foreign keys with `RESTRICT`, `CHECK` and `UNIQUE` constraints, a partial unique index for one confirmed registration per user and event.
- **Concurrency:** the last seat is protected by a transaction with `SELECT … FOR UPDATE`.
- **CORS** is limited to `CLIENT_URL`. `.env` files are ignored by Git; only `.env.example` files with placeholders are committed.

Known limitations (planned for the final):

- No rate limiting on login and 2FA codes.
- The role inside a token is not re-read from the database, so a role change applies at the user's next sign-in.
- The venue double-booking check is performed before the insert, not atomically; there is no database exclusion constraint, so two simultaneous requests could both pass it.
- The Events pages in the React app require a login, even though the `GET /api/events` endpoints are public.
- The SQL dump contains `psql` commands, so it must be restored with `psql` (see [Installation & Setup](#11-installation--setup)).

## 15. Midterm Demo Flow

1. Start PostgreSQL, the API and the front end. Open `/api/health`.
2. **Register** a new attendee and show the validation messages (weak password, existing email), then log out.
3. **Attendee:** browse events, use search, category and city filters and pagination, open Event Details. Try to open `/organizer/dashboard` → redirected (role protection).
4. **Two-factor authentication:** open *Security settings*, scan the QR code, enable 2FA and save the backup codes. Log out and log in again with the 6-digit code (and show a backup code once).
5. **Organizer:** open the dashboard statistics, create an event as a draft, publish it, edit it, then try to book the same venue at an overlapping time to show the **409 double-booking** message. Cancel an event with the confirmation modal and delete a draft.
6. **Admin:** *Users* (search, role filter, pagination, change a role, reset 2FA), *Venues* and *Categories* (create, edit, delete, and show the validation and "in use" errors).
7. Show the **phone-width layout** (bottom navigation) from the browser's device toolbar.
8. Mention the backend-only registration API (transaction + `FOR UPDATE`) and the final-project roadmap.

## 16. Final Project Roadmap

- Registration interface: Register button on Event Details and the My Tickets page.
- Electronic ticket view and the Attendees & Check-in page.
- Notifications (API and interface), using the existing `notifications` table.
- Real-time seat updates and notifications with Socket.IO.
- Combined Admin Dashboard overview.
- Rate limiting for login and 2FA, and automated tests.
