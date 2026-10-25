import { Link } from "react-router-dom";
import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import { validateLogin } from "../authValidation";

/**
 * Email + password form. onSubmit(values) does the API call.
 */
const LoginForm = ({ onSubmit, notice }) => {
  const {
    values,
    errors,
    formError,
    setFormError,
    submitting,
    handleChange,
    handleSubmit,
  } = useForm({ email: "", password: "", remember: true }, validateLogin);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="eyebrow">WELCOME BACK</div>
      <h2>Sign in to EventFlow</h2>
      <p className="subtitle">Use your account to continue.</p>

      {notice && !formError && <Alert variant="info">{notice}</Alert>}
      <Alert variant="danger" onClose={() => setFormError("")}>
        {formError}
      </Alert>

      <FormField
        label="Email address"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        placeholder="you@example.com"
        autoFocus
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
        placeholder="Your password"
      />

      <div className="form-options">
        <label className="checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={values.remember}
            onChange={handleChange}
          />
          Remember me
        </label>
      </div>

      <Button type="submit" full loading={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="divider">or</div>
      <p className="auth-switch">
        New to EventFlow?{" "}
        <Link to="/register" className="link">
          Create account
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
