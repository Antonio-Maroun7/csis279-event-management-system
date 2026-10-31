/**
 * Venue DTOs - the shape of venue data sent by the API.
 * All entity -> DTO conversion is done in venue.mapper.js.
 */
const VenueMapper = require("./venue.mapper");

/**
 * One venue. Direction: entity -> response DTO.
 */
const toResponseDto = VenueMapper.entityToResponseDto;

/**
 * A list of venues. Direction: entities -> response DTO list.
 */
const toListDto = VenueMapper.entityToListDto;

module.exports = {
  toResponseDto,
  toListDto,
};
