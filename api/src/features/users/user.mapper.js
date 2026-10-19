/**
 * User mapper - the single place that converts UserEntity objects to DTOs.
 * The password hash and the 2FA secret are never copied to a DTO.
 */

/**
 * Converts one entity to the public response DTO.
 * Direction: entity -> response DTO.
 * @param {import("./user.entity") | null} entity
 * @returns {{
 *   id: number,
 *   first_name: string,
 *   last_name: string,
 *   email: string,
 *   role: string,
 *   two_factor_enabled: boolean,
 *   created_at: Date
 * } | null}
 */

const entityToResponseDto = (entity) => {
  if (!entity) return null;
  return {
    id: entity.id,
    first_name: entity.first_name,
    last_name: entity.last_name,
    email: entity.email,
    role: entity.role,
    two_factor_enabled: entity.two_factor_enabled,
    created_at: entity.created_at,
  };
};

/**
 * Converts a list of entities to a list of response DTOs.
 * Direction: entities -> response DTO list.
 * @param {Array<import("./user.entity")>} entities
 * @returns {Array<Object>}
 */
const entityToListDto = (entities) => {
  return (entities || []).map(entityToResponseDto);
};

module.exports = {
  entityToResponseDto,
  entityToListDto,
};
