import {
  collectErrors,
  maxLength,
  required,
} from "../../shared/utils/validators";

// same rules as the backend: required, at most 100 characters (VARCHAR(100))
export const validateCategory = (values) =>
  collectErrors({
    name:
      required(values.name, "Category name") ||
      maxLength(values.name, 100, "Category name"),
  });
