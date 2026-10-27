import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import Modal from "../../../shared/components/ui/Modal";
import { validateChangePassword } from "../userValidation";

const INITIAL_VALUES = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

/**
 * Dialog with the change-password form.
 * The form is only mounted while the dialog is open, so it starts empty every time.
 */
const ChangePasswordForm = ({ onSubmit, onCancel }) => {
  const { values, errors, formError, submitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, validateChangePassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Alert variant="danger">{formError}</Alert>

      <FormField
        label="Current password"
        name="current_password"
        type="password"
        value={values.current_password}
        onChange={handleChange}
        error={errors.current_password}
        autoComplete="current-password"
        autoFocus
      />
      <FormField
        label="New password"
        name="new_password"
        type="password"
        value={values.new_password}
        onChange={handleChange}
        error={errors.new_password}
        autoComplete="new-password"
        help="At least 8 characters with a letter and a number."
      />
      <FormField
        label="Confirm new password"
        name="confirm_password"
        type="password"
        value={values.confirm_password}
        onChange={handleChange}
        error={errors.confirm_password}
        autoComplete="new-password"
      />

      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Update password
        </Button>
      </div>
    </form>
  );
};

const ChangePasswordModal = ({ show, onSubmit, onClose }) => {
  return (
    <Modal show={show} title="Change password" icon="⚿" onClose={onClose}>
      <ChangePasswordForm onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
};

export default ChangePasswordModal;
