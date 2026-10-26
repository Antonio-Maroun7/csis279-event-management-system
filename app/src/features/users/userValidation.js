import {
  collectErrors,
  maxLength,
  password,
  required,
} from "../../shared/utils/validators";

export const validateProfile = (values) =>
  collectErrors({
    first_name:
      required(values.first_name, "First name") ||
      maxLength(values.first_name, 60, "First name"),
    last_name:
      required(values.last_name, "Last name") ||
      maxLength(values.last_name, 60, "Last name"),
  });

export const validateChangePassword = (values) =>
  collectErrors({
    current_password: values.current_password
      ? undefined
      : "Current password is required",
    new_password:
      password(values.new_password) ||
      (values.new_password === values.current_password
        ? "New password must be different from the current password"
        : undefined),
    confirm_password:
      values.confirm_password !== values.new_password
        ? "Passwords do not match"
        : undefined,
  });
