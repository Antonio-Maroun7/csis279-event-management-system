/**
 * Registration DTOs - the shape of registration data sent by the API.
 * All conversion is done in registration.mapper.js.
 */
const RegistrationMapper = require("./registration.mapper");

/**
 * One registration with its ticket and event. Direction: entity -> response DTO.
 */
const toResponseDto = RegistrationMapper.entityToResponseDto;

/**
 * A list of registrations. Direction: entities -> response DTO list.
 */
const toListDto = RegistrationMapper.entityToListDto;

/**
 * One attendee row. Direction: entity -> attendee DTO.
 */
const toAttendeeDto = RegistrationMapper.entityToAttendeeDto;

/**
 * A list of attendees. Direction: entities -> attendee DTO list.
 */
const toAttendeeListDto = RegistrationMapper.entityToAttendeeListDto;

/**
 * The "event" block of the attendees response. Direction: event entity -> DTO.
 */
const toAttendeesEventDto = RegistrationMapper.eventToAttendeesEventDto;

module.exports = {
  toResponseDto,
  toListDto,
  toAttendeeDto,
  toAttendeeListDto,
  toAttendeesEventDto,
};
