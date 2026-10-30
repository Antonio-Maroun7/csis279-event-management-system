/**
 * Category DTOs - the shape of category data sent by the API.
 * All entity -> DTO conversion is done in category.mapper.js.
 */
const CategoryMapper = require("./category.mapper");

/**
 * One category. Direction: entity -> response DTO.
 */
const toResponseDto = CategoryMapper.entityToResponseDto;

/**
 * A list of categories. Direction: entities -> response DTO list.
 */
const toListDto = CategoryMapper.entityToListDto;

module.exports = {
  toResponseDto,
  toListDto,
};
