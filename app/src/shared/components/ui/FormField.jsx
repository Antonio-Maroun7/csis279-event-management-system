/**
 * Label + input (or select / textarea) + error message.
 *
 * <FormField label="Email address" name="email" type="email"
 *            value={values.email} onChange={handleChange} error={errors.email} />
 *
 * <FormField as="select" label="Role" name="role" ...>
 *   <option value="attendee">Attendee</option>
 * </FormField>
 */
const FormField = ({
  label,
  name,
  as = "input",
  error,
  help,
  className = "",
  children,
  ...inputProps
}) => {
  const id = inputProps.id || `field-${name}`; // generate an id if not provided
  const Control = as; // the form control element (input, textarea, select, etc.)
  const controlClass = {
    input: "input",
    select: "select",
    textarea: "textarea",
  }[as]; // the CSS class for the form control element

  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <Control
        id={id} // the id for the form control element
        name={name} // the name for the form control element
        className={`${controlClass} ${error ? "is-invalid" : ""}`}
        aria-invalid={Boolean(error)}
        {...inputProps}
      >
        {children}
      </Control>
      {error ? (
        <div className="field-error">{error}</div>
      ) : (
        help && <div className="help">{help}</div>
      )}
    </div>
  );
};

export default FormField;
