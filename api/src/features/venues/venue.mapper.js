/**
 * Venue mapper - the single place that converts VenueEntity objects to DTOs.
 */

/**
 * Converts one entity to the response DTO.
 * Direction: entity -> response DTO.
 * @param {import("./venue.entity") | null} entity
 * @returns {{
 *   id: number,
 *   name: string,
 *   address: string,
 *   city: string,
 *   max_capacity: number,
 *   events_count: number,
 *   created_at: Date,
 *   updated_at: Date
 * } | null}
 */
const entityToResponseDto = (entity) => {
  if (!entity) return null;

  return {
    id: entity.id,
    name: entity.name,
    address: entity.address,
    city: entity.city,
    max_capacity: entity.max_capacity,
    events_count: entity.events_count,
    created_at: entity.created_at,
    updated_at: entity.updated_at,
  };
};

/**
 * Converts a list of entities to a list of response DTOs.
 * Direction: entities -> response DTO list.
 * @param {Array<import("./venue.entity")>} entities
 * @returns {Array<Object>}
 */
const entityToListDto = (entities) => {
  return (entities || []).map(entityToResponseDto);
};

module.exports = {
  entityToResponseDto,
  entityToListDto,
};
