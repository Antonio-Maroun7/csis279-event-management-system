import { Link } from "react-router-dom";
import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import { validateRegister } from "../authValidation";

const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
};

/**
 * Sign-up form. onSubmit(values) does the API call.
 */
const RegisterForm = ({ onSubmit }) => {
  const {
    values,
    errors,
    formError,
    setFormError,
    submitting,
    handleChange,
    handleSubmit,
  } = useForm(INITIAL_VALUES, validateRegister);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="eyebrow">CREATE ACCOUNT</div>
      <h2>Join EventFlow</h2>
      <p className="subtitle">Attendee accounts are created by default.</p>

      <Alert variant="danger" onClose={() => setFormError("")}>
        {formError}
      </Alert>

      <div className="form-row">
        <FormField
          label="First name"
          name="first_name"
          value={values.first_name}
          onChange={handleChange}
          error={errors.first_name}
          autoComplete="given-name"
          placeholder="Antonio"
          maxLength={60}
          autoFocus
        />
        <FormField
          label="Last name"
          name="last_name"
          value={values.last_name}
          onChange={handleChange}
          error={errors.last_name}
          autoComplete="family-name"
          placeholder="Maroun"
          maxLength={60}
        />
      </div>
      <FormField
        label="Email address"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        placeholder="antonio@example.com"
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
        placeholder="Minimum 8 characters"
        help="At least 8 characters with a letter and a number."
      />
      <FormField
        label="Confirm password"
        name="confirm_password"
        type="password"
        value={values.confirm_password}
        onChange={handleChange}
        error={errors.confirm_password}
        autoComplete="new-password"
        placeholder="Repeat password"
      />

      <Button type="submit" full loading={submitting}>
        {submitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="auth-switch mt-3">
        Already have an account?{" "}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
