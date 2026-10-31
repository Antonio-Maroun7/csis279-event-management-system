/**
 * Event mapper - the single place that converts EventEntity objects to DTOs.
 * The flat joined columns become small nested objects (category, venue, organizer).
 */

/**
 * Converts one entity to the response DTO.
 * Direction: entity -> response DTO.
 * @param {import("./event.entity") | null} entity
 * @returns {Object|null}
 */
const entityToResponseDto = (entity) => {
  if (!entity) return null;

  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    start_time: entity.start_time,
    end_time: entity.end_time,
    capacity: entity.capacity,
    price: entity.price,
    status: entity.status,
    seats_taken: entity.seats_taken,
    seats_left: Math.max(0, entity.capacity - entity.seats_taken),
    is_past: entity.is_past,
    category: {
      id: entity.category_id,
      name: entity.category_name,
    },
    venue: {
      id: entity.venue_id,
      name: entity.venue_name,
      address: entity.venue_address,
      city: entity.venue_city,
      max_capacity: entity.venue_max_capacity,
    },
    organizer: {
      id: entity.organizer_id,
      first_name: entity.organizer_first_name,
      last_name: entity.organizer_last_name,
    },
    created_at: entity.created_at,
    updated_at: entity.updated_at,
  };
};

/**
 * Converts a list of entities to a list of response DTOs.
 * Direction: entities -> response DTO list.
 * @param {Array<import("./event.entity")>} entities
 * @returns {Array<Object>}
 */
const entityToListDto = (entities) => {
  return (entities || []).map(entityToResponseDto);
};

/**
 * Converts the validated request body to the columns saved in the events table.
 * Direction: request body -> entity fields.
 * An empty description is stored as NULL.
 * @param {Object} body
 * @returns {{ title: string, description: string|null, category_id: number,
 *   venue_id: number, start_time: string, end_time: string,
 *   capacity: number, price: number }}
 */
const requestToEntityFields = (body) => ({
  title: body.title,
  description: body.description ? body.description : null,
  category_id: body.category_id,
  venue_id: body.venue_id,
  start_time: body.start_time,
  end_time: body.end_time,
  capacity: body.capacity,
  price: body.price,
});

module.exports = {
  entityToResponseDto,
  entityToListDto,
  requestToEntityFields,
};
