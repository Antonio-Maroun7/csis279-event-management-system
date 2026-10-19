/**
 * User DTOs - the shape of user data sent by the API.
 * All entity -> DTO conversion is done in user.mapper.js.
 */
const UserMapper = require("./user.mapper");

/**
 * One user. Direction: entity -> response DTO.
 */
const toResponseDto = UserMapper.entityToResponseDto;

/**
 * A list of users. Direction: entities -> response DTO list.
 */
const toListDto = UserMapper.entityToListDto;

module.exports = {
  toResponseDto,
  toListDto,
};
