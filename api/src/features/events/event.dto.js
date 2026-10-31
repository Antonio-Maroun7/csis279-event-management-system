/**
 * Event DTOs - the shape of event data sent and received by the API.
 * All conversion is done in event.mapper.js.
 */
const EventMapper = require("./event.mapper");

/**
 * One event. Direction: entity -> response DTO.
 */
const toResponseDto = EventMapper.entityToResponseDto;

/**
 * A list of events. Direction: entities -> response DTO list.
 */
const toListDto = EventMapper.entityToListDto;

/**
 * Create / update body. Direction: request body -> entity fields.
 */
const fromRequest = EventMapper.requestToEntityFields;

module.exports = {
  toResponseDto,
  toListDto,
  fromRequest,
};
