/**
 * Event service: business rules for events.
 *
 * Who can do what:
 * - everybody: list published events, open a published / cancelled event
 * - organizer: create events, manage (edit, publish, cancel, delete) their own events
 * - admin: manage every event
 */
const AppError = require("../../shared/errors/AppError");
const EventRepository = require("./event.repository");
const EventDto = require("./event.dto");
const CategoryRepository = require("../categories/category.repository");
const VenueRepository = require("../venues/venue.repository");

const FOREIGN_KEY_VIOLATION = "23503";

/** Statuses that can still be edited, published or cancelled. */
const ACTIVE_STATUSES = ["draft", "published"];

/**
 * 400 with one field error, shown under that field in the event form.
 * @param {string} field
 * @param {string} message
 * @returns {AppError}
 */
const fieldError = (field, message) =>
  AppError.badRequest("Validation failed", [{ field, message }]);

/**
 * true when the user may edit / publish / cancel / delete this event.
 * @param {import("./event.entity")} event
 * @param {{ id: number, role: string }} [user]
 * @returns {boolean}
 */
const canManage = (event, user) =>
  Boolean(user) &&
  (user.role === "admin" ||
    (user.role === "organizer" && event.organizer_id === user.id));

/**
 * Handles event operations and DTO mapping.
 */
class EventService {
  // ── Reading ────────────────────────────────────────────────

  /**
   * Public list: published events that have not ended, soonest first.
   * @param {{ search?: string, category_id?: number, city?: string, page?: number, limit?: number }} filters
   * @returns {Promise<{ events: Object[], total: number, page: number, limit: number, total_pages: number }>}
   */
  static async listPublishedEvents({ page = 1, limit = 9, ...filters }) {
    const offset = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      EventRepository.findPublished({ ...filters, limit, offset }),
      EventRepository.countPublished(filters),
    ]);

    return {
      events: EventDto.toListDto(entities),
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /**
   * Organizer: their own events. Admin: every event.
   * Also returns the numbers shown on the organizer dashboard.
   * @param {{ id: number, role: string }} user
   * @param {{ status?: string, search?: string, page?: number, limit?: number }} filters
   * @returns {Promise<Object>}
   */
  static async listManagedEvents(user, { page = 1, limit = 10, ...filters }) {
    const offset = (page - 1) * limit;
    const organizerId = user.role === "admin" ? null : user.id;
    const scope = { ...filters, organizer_id: organizerId };

    const [entities, total, stats, registrations] = await Promise.all([
      EventRepository.findManaged({ ...scope, limit, offset }),
      EventRepository.countManaged(scope),
      EventRepository.getManagedStats(organizerId),
      EventRepository.countConfirmedRegistrations(organizerId),
    ]);

    return {
      events: EventDto.toListDto(entities),
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      counts: stats.counts,
      stats: {
        registrations,
        checked_in: stats.checked_in,
        upcoming: stats.upcoming,
        next_start_time: stats.next_start_time,
      },
    };
  }

  /**
   * One event. A draft is only visible to its organizer and to admins:
   * for everybody else it does not exist (404).
   * @param {number} id
   * @param {{ id: number, role: string }} [user] - undefined for visitors
   * @returns {Promise<Object>}
   * @throws {AppError} 404 not found
   */
  static async getEventById(id, user) {
    const event = await EventRepository.findById(id);

    if (!event || (event.status === "draft" && !canManage(event, user))) {
      throw AppError.notFound("Event not found");
    }
    return EventDto.toResponseDto(event);
  }

  // ── Writing ────────────────────────────────────────────────

  /**
   * Organizer / admin: creates an event as a draft or published directly.
   * @param {{ id: number, role: string }} user
   * @param {Object} body - validated request body
   * @returns {Promise<Object>}
   */
  static async createEvent(user, body) {
    const fields = EventDto.fromRequest(body);
    const status = body.status || "draft";

    await EventService.checkEventRules(fields, {
      organizerId: user.id,
      startMustBeFuture: true,
    });

    const id = await EventRepository.create(user.id, fields, status);
    return EventService.getEventById(id, user);
  }

  /**
   * Owner / admin: updates an event that is still a draft or published.
   * @param {number} id
   * @param {{ id: number, role: string }} user
   * @param {Object} body - validated request body
   * @returns {Promise<Object>}
   * @throws {AppError} 403 not the owner, 404 not found, 409 not editable
   */
  static async updateEvent(id, user, body) {
    const event = await EventService.findManageableEvent(id, user);

    if (!ACTIVE_STATUSES.includes(event.status)) {
      throw AppError.conflict(`A ${event.status} event cannot be edited`);
    }
    if (event.is_past) {
      throw AppError.conflict(
        "This event has already ended and cannot be edited",
      );
    }

    const fields = EventDto.fromRequest(body);

    // the start can stay in the past only if it was not changed (event already running)
    const startChanged =
      new Date(fields.start_time).getTime() !==
      new Date(event.start_time).getTime();

    await EventService.checkEventRules(fields, {
      excludeId: id,
      organizerId: event.organizer_id,
      startMustBeFuture: startChanged,
    });

    if (fields.capacity < event.seats_taken) {
      throw AppError.conflict(
        `Capacity cannot be lower than the ${event.seats_taken} seats already taken`,
      );
    }

    await EventRepository.update(id, fields);
    return EventService.getEventById(id, user);
  }

  /**
   * Owner / admin: makes a draft visible to attendees.
   * @param {number} id
   * @param {{ id: number, role: string }} user
   * @returns {Promise<Object>}
   * @throws {AppError} 409 when the event is not a draft or already started
   */
  static async publishEvent(id, user) {
    const event = await EventService.findManageableEvent(id, user);

    if (event.status !== "draft") {
      throw AppError.conflict(
        `Only draft events can be published (this one is ${event.status})`,
      );
    }
    if (new Date(event.start_time) <= new Date()) {
      throw AppError.conflict(
        "The start time has already passed: edit the dates before publishing",
      );
    }

    await EventRepository.updateStatus(id, "published");
    return EventService.getEventById(id, user);
  }

  /**
   * Owner / admin: cancels a draft or published event.
   * Registrations and tickets stay in the database for history
   * (attendees are notified in the notifications step).
   * @param {number} id
   * @param {{ id: number, role: string }} user
   * @returns {Promise<Object>}
   * @throws {AppError} 409 when already cancelled / completed / ended
   */
  static async cancelEvent(id, user) {
    const event = await EventService.findManageableEvent(id, user);

    if (!ACTIVE_STATUSES.includes(event.status)) {
      throw AppError.conflict(`This event is already ${event.status}`);
    }
    if (event.is_past) {
      throw AppError.conflict(
        "This event has already ended and cannot be cancelled",
      );
    }

    await EventRepository.updateStatus(id, "cancelled");
    return EventService.getEventById(id, user);
  }

  /**
   * Owner / admin: deletes a draft. Published events are cancelled instead,
   * so attendees keep their history.
   * @param {number} id
   * @param {{ id: number, role: string }} user
   * @returns {Promise<void>}
   */
  static async deleteEvent(id, user) {
    const event = await EventService.findManageableEvent(id, user);

    if (event.status !== "draft") {
      throw AppError.conflict(
        "Only draft events can be deleted. Cancel the event instead.",
      );
    }

    try {
      await EventRepository.delete(id);
    } catch (err) {
      if (err.code === FOREIGN_KEY_VIOLATION) {
        throw AppError.conflict(
          "This event has registrations and cannot be deleted",
        );
      }
      throw err;
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  /**
   * Loads an event and checks that the user may manage it.
   * @param {number} id
   * @param {{ id: number, role: string }} user
   * @returns {Promise<import("./event.entity")>}
   * @throws {AppError} 404 not found, 403 someone else's event
   */
  static async findManageableEvent(id, user) {
    const event = await EventRepository.findById(id);

    // an organizer cannot even see someone else's draft, so it is a 404
    if (!event || (event.status === "draft" && !canManage(event, user))) {
      throw AppError.notFound("Event not found");
    }
    if (!canManage(event, user)) {
      throw AppError.forbidden("You can only manage your own events");
    }
    return event;
  }

  /**
   * Rules shared by create and update.
   * @param {Object} fields - see EventDto.fromRequest
   * @param {{ excludeId?: number, organizerId: number, startMustBeFuture: boolean }} options
   * organizerId: owner of the event; the title of a conflicting event is shown only to its own organizer.
   * @returns {Promise<void>}
   * @throws {AppError} 400 field error or 409 venue already booked
   */
  static async checkEventRules(
    fields,
    { excludeId, organizerId, startMustBeFuture },
  ) {
    if (startMustBeFuture && new Date(fields.start_time) <= new Date()) {
      throw fieldError("start_time", "Start time must be in the future");
    }

    const [category, venue] = await Promise.all([
      CategoryRepository.findById(fields.category_id),
      VenueRepository.findById(fields.venue_id),
    ]);

    if (!category) {
      throw fieldError("category_id", "Category not found");
    }
    if (!venue) {
      throw fieldError("venue_id", "Venue not found");
    }
    if (fields.capacity > venue.max_capacity) {
      throw fieldError(
        "capacity",
        `Capacity cannot be more than the venue capacity (${venue.max_capacity} seats)`,
      );
    }

    const overlapping = await EventRepository.findOverlapping({
      venue_id: fields.venue_id,
      start_time: fields.start_time,
      end_time: fields.end_time,
      excludeId,
    });
    if (overlapping) {
      const booked = `${venue.name} is already booked at that time`;
      throw AppError.conflict(
        overlapping.organizer_id === organizerId
          ? `${booked} for "${overlapping.title}"`
          : booked,
      );
    }
  }
}

module.exports = EventService;
