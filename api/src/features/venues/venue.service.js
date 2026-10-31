/**
 * Venue service: business rules for venues.
 */
const AppError = require("../../shared/errors/AppError");
const VenueRepository = require("./venue.repository");
const VenueDto = require("./venue.dto");

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

/**
 * Message used when the name + city pair is already taken.
 * @param {string} name
 * @param {string} city
 * @returns {string}
 */
const duplicateMessage = (name, city) =>
  `A venue named "${name}" already exists in ${city}`;

/**
 * Handles venue operations and DTO mapping.
 */
class VenueService {
  /**
   * Returns all venues (public: used by the event form and event pages).
   * @param {{ search?: string, city?: string }} filters
   * @returns {Promise<{ venues: Object[], total: number }>}
   */
  static async listVenues(filters) {
    const entities = await VenueRepository.findAll(filters);
    return {
      venues: VenueDto.toListDto(entities),
      total: entities.length,
    };
  }

  /**
   * Returns one venue.
   * @param {number} id
   * @returns {Promise<Object>}
   * @throws {AppError} 404 when the venue does not exist.
   */
  static async getVenueById(id) {
    const venue = await VenueRepository.findById(id);
    if (!venue) {
      throw AppError.notFound("Venue not found");
    }
    return VenueDto.toResponseDto(venue);
  }

  /**
   * Admin: creates a venue.
   * @param {{ name: string, address: string, city: string, max_capacity: number }} data
   * @returns {Promise<Object>}
   * @throws {AppError} 409 when the same name already exists in that city.
   */
  static async createVenue({ name, address, city, max_capacity }) {
    if (await VenueRepository.findByNameAndCity(name, city)) {
      throw AppError.conflict(duplicateMessage(name, city));
    }

    try {
      const venue = await VenueRepository.create({
        name,
        address,
        city,
        max_capacity,
      });
      return VenueDto.toResponseDto(venue);
    } catch (err) {
      // two admins created the same venue at the same moment (migration 002)
      if (err.code === UNIQUE_VIOLATION) {
        throw AppError.conflict(duplicateMessage(name, city));
      }
      throw err;
    }
  }

  /**
   * Admin: updates a venue.
   * The capacity cannot go below the capacity of an active event held there.
   * @param {number} id
   * @param {{ name: string, address: string, city: string, max_capacity: number }} data
   * @returns {Promise<Object>}
   * @throws {AppError} 404 not found, 409 duplicate name or capacity too small.
   */
  static async updateVenue(id, { name, address, city, max_capacity }) {
    const existing = await VenueRepository.findById(id);
    if (!existing) {
      throw AppError.notFound("Venue not found");
    }

    if (await VenueRepository.findByNameAndCity(name, city, id)) {
      throw AppError.conflict(duplicateMessage(name, city));
    }

    const largest = await VenueRepository.findLargestActiveEventCapacity(id);
    if (max_capacity < largest) {
      throw AppError.conflict(
        `Max capacity cannot be lower than ${largest}: an event at this venue already has ${largest} seats`,
      );
    }

    try {
      await VenueRepository.update(id, { name, address, city, max_capacity });
    } catch (err) {
      if (err.code === UNIQUE_VIOLATION) {
        throw AppError.conflict(duplicateMessage(name, city));
      }
      throw err;
    }

    // read it again so events_count is included
    return VenueService.getVenueById(id);
  }

  /**
   * Admin: deletes a venue that no event uses.
   * @param {number} id
   * @returns {Promise<void>}
   * @throws {AppError} 404 not found, 409 still used by events.
   */
  static async deleteVenue(id) {
    const venue = await VenueRepository.findById(id);
    if (!venue) {
      throw AppError.notFound("Venue not found");
    }

    if (venue.events_count > 0) {
      throw AppError.conflict(
        `This venue is used by ${venue.events_count} event(s) and cannot be deleted`,
      );
    }

    try {
      await VenueRepository.delete(id);
    } catch (err) {
      // an event was created at this venue in the meantime
      if (err.code === FOREIGN_KEY_VIOLATION) {
        throw AppError.conflict(
          "This venue is used by events and cannot be deleted",
        );
      }
      throw err;
    }
  }
}

module.exports = VenueService;
