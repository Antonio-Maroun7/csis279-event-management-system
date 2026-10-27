import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import { validateProfile } from "../userValidation";

/**
 * Edit first / last name. The email and role cannot be changed here.
 */
const ProfileForm = ({ user, onSave, onCancel }) => {
  const { values, errors, formError, submitting, handleChange, handleSubmit } =
    useForm(
      { first_name: user.first_name, last_name: user.last_name },
      validateProfile,
    );

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <Alert variant="danger">{formError}</Alert>

      <FormField
        label="First name"
        name="first_name"
        value={values.first_name}
        onChange={handleChange}
        error={errors.first_name}
        maxLength={60}
        autoFocus
      />
      <FormField
        label="Last name"
        name="last_name"
        value={values.last_name}
        onChange={handleChange}
        error={errors.last_name}
        maxLength={60}
      />
      <FormField
        label="Email"
        name="email"
        value={user.email}
        disabled
        help="Your email is used to sign in and cannot be changed."
      />

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
