import {
  collectErrors,
  email,
  maxLength,
  password,
  required,
} from "../../shared/utils/validators";

export const validateLogin = (values) =>
  collectErrors({
    email: email(values.email),
    password: values.password ? undefined : "Password is required",
  });

export const validateRegister = (values) =>
  collectErrors({
    first_name:
      required(values.first_name, "First name") ||
      maxLength(values.first_name, 60, "First name"),
    last_name:
      required(values.last_name, "Last name") ||
      maxLength(values.last_name, 60, "Last name"),
    email: email(values.email),
    password: password(values.password),
    confirm_password:
      values.confirm_password !== values.password
        ? "Passwords do not match"
        : undefined,
  });
