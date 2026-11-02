/**
 * Registration service: business rules for registering, cancelling,
 * "my tickets", the attendee list and check-in.
 *
 * Who can do what:
 * - attendee: register, cancel their own registration, list their tickets
 * - any logged-in user: see their own registration for an event
 * - organizer (owner of the event) / admin: attendee list and check-in
 */
const AppError = require("../../shared/errors/AppError");
const RegistrationRepository = require("./registration.repository");
const TicketRepository = require("./ticket.repository");
const RegistrationDto = require("./registration.dto");
const EventService = require("../events/event.service");

const UNIQUE_VIOLATION = "23505";
const ONE_CONFIRMED_PER_USER = "uq_confirmed_registration";

/**
 * Formats a time as HH:mm (server time zone), e.g. "10:42".
 * @param {Date} date
 * @returns {string}
 */
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * "Sarah Haddad" - the full name of the attendee.
 * @param {import("./registration.entity")} registration
 * @returns {string}
 */
const fullName = (registration) =>
  `${registration.user_first_name} ${registration.user_last_name}`;

/**
 * 409 for a ticket that was already checked in.
 * @param {import("./registration.entity")} registration
 * @returns {AppError}
 */
const alreadyCheckedIn = (registration) =>
  AppError.conflict(
    `${fullName(registration)} was already checked in at ${formatTime(registration.checked_in_at)}`,
  );

/**
 * Handles registration operations and DTO mapping.
 */
class RegistrationService {
  // ── Attendee ───────────────────────────────────────────────

  /**
   * Registers the attendee to an event and creates their ticket.
   * Everything runs in ONE transaction. The event row is locked with
   * SELECT ... FOR UPDATE, so two requests for the last seat are served one
   * after the other: the second one sees the seat is gone and gets 409.
   * @param {number} eventId
   * @param {{ id: number, role: string }} user
   * @returns {Promise<Object>} the registration with its ticket
   * @throws {AppError} 404 event not found, 409 cancelled / started / already registered / sold out
   */
  static async register(eventId, user) {
    try {
      const registration = await RegistrationRepository.transaction(
        async (client) => {
          const event = await RegistrationRepository.lockEvent(eventId, client);

          // a draft does not exist for attendees (same as GET /api/events/:id)
          if (!event || event.status === "draft") {
            throw AppError.notFound("Event not found");
          }
          if (event.status !== "published") {
            throw AppError.conflict(`This event was ${event.status}`);
          }
          if (event.has_started) {
            throw AppError.conflict(
              "Registration is closed: this event has already started",
            );
          }
          if (
            await RegistrationRepository.hasConfirmed(eventId, user.id, client)
          ) {
            throw AppError.conflict(
              "You are already registered for this event",
            );
          }

          // safe: the event row is locked, nobody else can register until COMMIT
          const taken = await RegistrationRepository.countConfirmed(
            eventId,
            client,
          );
          if (taken >= event.capacity) {
            throw AppError.conflict("This event is sold out");
          }

          const registrationId = await RegistrationRepository.create(
            eventId,
            user.id,
            client,
          );
          await TicketRepository.create(registrationId, client);

          return RegistrationRepository.findById(registrationId, client);
        },
      );

      return RegistrationDto.toResponseDto(registration);
    } catch (err) {
      // safety net: the database itself refuses two confirmed registrations of one user
      if (
        err.code === UNIQUE_VIOLATION &&
        err.constraint === ONE_CONFIRMED_PER_USER
      ) {
        throw AppError.conflict("You are already registered for this event");
      }
      throw err;
    }
  }

  /**
   * Cancels the attendee's own registration. The seat becomes free again.
   * Someone else's registration does not exist for the user (404).
   * @param {number} id - registration id
   * @param {{ id: number, role: string }} user
   * @returns {Promise<Object>} the cancelled registration
   * @throws {AppError} 404 not found, 409 already cancelled / checked in / event started
   */
  static async cancelRegistration(id, user) {
    const registration = await RegistrationRepository.findById(id);

    if (!registration || registration.user_id !== user.id) {
      throw AppError.notFound("Registration not found");
    }
    RegistrationService.assertCanCancel(registration);

    const cancelled = await RegistrationRepository.cancel(id);
    if (!cancelled) {
      // changed between the read and the update (double click, check-in at the same time)
      RegistrationService.assertCanCancel(
        await RegistrationRepository.findById(id),
      );
    }

    return RegistrationDto.toResponseDto(
      await RegistrationRepository.findById(id),
    );
  }

  /**
   * The user's registrations for one tab, with the number of each tab.
   * upcoming = confirmed and not ended and not cancelled event,
   * past = confirmed and ended, cancelled = registration or event cancelled.
   * @param {{ id: number }} user
   * @param {{ status?: "upcoming"|"past"|"cancelled", page?: number, limit?: number }} filters
   * @returns {Promise<Object>}
   */
  static async listMyRegistrations(
    user,
    { status = "upcoming", page = 1, limit = 10 },
  ) {
    const offset = (page - 1) * limit;

    const [entities, counts] = await Promise.all([
      RegistrationRepository.findByUser({
        userId: user.id,
        status,
        limit,
        offset,
      }),
      RegistrationRepository.countByUser(user.id),
    ]);
    const total = counts[status];

    return {
      registrations: RegistrationDto.toListDto(entities),
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      counts,
    };
  }

  /**
   * The user's CONFIRMED registration for an event, or null.
   * @param {number} eventId
   * @param {{ id: number, role: string }} user
   * @returns {Promise<Object|null>}
   * @throws {AppError} 404 when the event does not exist (or is a draft the user cannot see)
   */
  static async getMyRegistration(eventId, user) {
    await EventService.getEventById(eventId, user);

    const registration =
      await RegistrationRepository.findConfirmedByUserAndEvent(
        eventId,
        user.id,
      );
    return RegistrationDto.toResponseDto(registration);
  }

  // ── Organizer / admin ──────────────────────────────────────

  /**
   * The confirmed attendees of an event with the attendance numbers.
   * @param {number} eventId
   * @param {{ id: number, role: string }} user
   * @param {{ search?: string, checked_in?: boolean, page?: number, limit?: number }} filters
   * @returns {Promise<Object>}
   * @throws {AppError} 404 not found, 403 someone else's event
   */
  static async listAttendees(eventId, user, { page = 1, limit = 10, ...rest }) {
    const event = await EventService.findManageableEvent(eventId, user);
    const offset = (page - 1) * limit;
    const filters = { ...rest, eventId };

    const [entities, total, stats] = await Promise.all([
      RegistrationRepository.findAttendees({ ...filters, limit, offset }),
      RegistrationRepository.countAttendees(filters),
      RegistrationRepository.getAttendeeStats(eventId),
    ]);

    return {
      event: RegistrationDto.toAttendeesEventDto(event),
      attendees: RegistrationDto.toAttendeeListDto(entities),
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      stats: {
        registered: stats.registered,
        capacity: event.capacity,
        checked_in: stats.checked_in,
        check_in_rate: stats.registered
          ? Math.round((stats.checked_in / stats.registered) * 100)
          : 0,
      },
    };
  }

  /**
   * Checks in the attendee that owns a ticket code (used by the row button
   * and by the "check in by ticket code" box).
   * @param {number} eventId
   * @param {{ id: number, role: string }} user
   * @param {string} ticketCode - trimmed and uppercased by the validator
   * @returns {Promise<{ message: string, attendee: Object }>}
   * @throws {AppError} 403/404 event, 404 unknown code, 409 cancelled / already checked in
   */
  static async checkIn(eventId, user, ticketCode) {
    const event = await EventService.findManageableEvent(eventId, user);

    if (event.status === "cancelled") {
      throw AppError.conflict("This event was cancelled");
    }

    const registrationId = await TicketRepository.findRegistrationIdByCode(
      ticketCode,
      eventId,
    );
    if (!registrationId) {
      throw AppError.notFound("No ticket with this code for this event");
    }

    const registration = await RegistrationRepository.findById(registrationId);
    RegistrationService.assertCanCheckIn(registration);

    const done = await TicketRepository.checkIn(registrationId);
    if (!done) {
      // someone else checked it in between the read and the update
      RegistrationService.assertCanCheckIn(
        await RegistrationRepository.findById(registrationId),
      );
    }

    const updated = await RegistrationRepository.findById(registrationId);
    return {
      message: `${fullName(updated)} checked in`,
      attendee: RegistrationDto.toAttendeeDto(updated),
    };
  }

  // ── Helpers ────────────────────────────────────────────────

  /**
   * Rules for cancelling a registration.
   * @param {import("./registration.entity")} registration
   * @returns {void}
   * @throws {AppError} 409 when the registration cannot be cancelled
   */
  static assertCanCancel(registration) {
    if (registration.status === "cancelled") {
      throw AppError.conflict("This registration is already cancelled");
    }
    if (registration.checked_in_at) {
      throw AppError.conflict("A checked-in ticket cannot be cancelled");
    }
    if (registration.event_has_started) {
      throw AppError.conflict("This event has already started");
    }
  }

  /**
   * Rules for checking in a ticket.
   * @param {import("./registration.entity")} registration
   * @returns {void}
   * @throws {AppError} 409 when the registration is cancelled or already checked in
   */
  static assertCanCheckIn(registration) {
    if (registration.status === "cancelled") {
      throw AppError.conflict("This registration was cancelled");
    }
    if (registration.checked_in_at) {
      throw alreadyCheckedIn(registration);
    }
  }
}

module.exports = RegistrationService;
