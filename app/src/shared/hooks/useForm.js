import { useState } from "react";

/**
 * Small form helper used by every form in the app.
 *
 * const { values, errors, formError, submitting, handleChange, handleSubmit } =
 *   useForm({ email: "", password: "" }, validateLogin);
 *
 * <form onSubmit={handleSubmit(async (values) => login(values))}>
 *
 * - validate(values) returns { field: "message" } for every invalid field
 * - errors coming back from the API (ApiError.fieldErrors) are shown on the fields too
 */
const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues); // stores form field values
  const [errors, setErrors] = useState({}); // stores field-specific validation errors
  const [formError, setFormError] = useState(""); // stores general form error message
  const [submitting, setSubmitting] = useState(false); // indicates if the form is currently being submitted

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // hide the error of a field as soon as the user edits it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (onSubmit) => async (event) => {
    event.preventDefault();
    setFormError("");

    const found = validate ? validate(values) : {}; // run validation and get field errors if any
    if (Object.keys(found).length > 0) {
      setErrors(found); //
      return;
    }

    setErrors({}); // clear previous field errors
    setSubmitting(true); // mark the form as submitting

    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(error.fieldErrors || {}); // set field-specific errors from the API if any
      setFormError(error.message || "Something went wrong"); // set general form error message from the API if any
    } finally {
      setSubmitting(false); // mark the form as not submitting anymore
    }
  };

  const reset = (nextValues = initialValues) => {
    // reset form to initial or provided values
    setValues(nextValues); // update form values
    setErrors({}); // clear field-specific errors
    setFormError(""); // clear general form error message
  };

  return {
    values,
    errors,
    formError,
    setFormError,
    submitting,
    handleChange,
    handleSubmit,
    reset,
  };
};

export default useForm;
