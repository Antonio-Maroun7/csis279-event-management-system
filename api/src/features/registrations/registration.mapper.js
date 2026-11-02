/**
 * Registration mapper - the single place that converts RegistrationEntity
 * objects to DTOs (the "my ticket" shape and the attendee shape).
 */

/**
 * Converts one entity to the attendee's own registration (with ticket and event).
 * Direction: entity -> response DTO.
 * @param {import("./registration.entity") | null} entity
 * @returns {Object|null}
 */
const entityToResponseDto = (entity) => {
  if (!entity) return null;

  return {
    id: entity.id,
    status: entity.status,
    registered_at: entity.registered_at,
    cancelled_at: entity.cancelled_at,
    ticket: {
      code: entity.ticket_code,
      checked_in_at: entity.checked_in_at,
    },
    event: {
      id: entity.event_id,
      title: entity.event_title,
      start_time: entity.event_start_time,
      end_time: entity.event_end_time,
      status: entity.event_status,
      is_past: entity.event_is_past,
      category: {
        id: entity.category_id,
        name: entity.category_name,
      },
      venue: {
        id: entity.venue_id,
        name: entity.venue_name,
        city: entity.venue_city,
      },
    },
  };
};

/**
 * Converts a list of entities to a list of registration DTOs.
 * Direction: entities -> response DTO list.
 * @param {Array<import("./registration.entity")>} entities
 * @returns {Array<Object>}
 */
const entityToListDto = (entities) => {
  return (entities || []).map(entityToResponseDto);
};

/**
 * Converts one entity to a row of the organizer's attendee list.
 * Direction: entity -> attendee DTO.
 * @param {import("./registration.entity") | null} entity
 * @returns {Object|null}
 */
const entityToAttendeeDto = (entity) => {
  if (!entity) return null;

  return {
    registration_id: entity.id,
    status: entity.status,
    registered_at: entity.registered_at,
    user: {
      id: entity.user_id,
      first_name: entity.user_first_name,
      last_name: entity.user_last_name,
      email: entity.user_email,
    },
    ticket: {
      code: entity.ticket_code,
      checked_in_at: entity.checked_in_at,
    },
  };
};

/**
 * Converts a list of entities to a list of attendee DTOs.
 * Direction: entities -> attendee DTO list.
 * @param {Array<import("./registration.entity")>} entities
 * @returns {Array<Object>}
 */
const entityToAttendeeListDto = (entities) => {
  return (entities || []).map(entityToAttendeeDto);
};

/**
 * Converts the event entity to the small "event" block of the attendees response.
 * @param {import("../events/event.entity")} event
 * @returns {{ id: number, title: string, start_time: Date, capacity: number, status: string }}
 */
const eventToAttendeesEventDto = (event) => ({
  id: event.id,
  title: event.title,
  start_time: event.start_time,
  capacity: event.capacity,
  status: event.status,
});

module.exports = {
  entityToResponseDto,
  entityToListDto,
  entityToAttendeeDto,
  entityToAttendeeListDto,
  eventToAttendeesEventDto,
};
