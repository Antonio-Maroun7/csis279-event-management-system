import { useState } from "react";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import CodeInput from "../../../shared/components/ui/CodeInput";
import FormField from "../../../shared/components/ui/FormField";
import Modal from "../../../shared/components/ui/Modal";

/**
 * The form inside the dialog. It is only mounted while the dialog is open,
 * so it starts empty every time.
 */
const CodeConfirmForm = ({
  allowBackupCode,
  confirmLabel,
  variant,
  onSubmit,
  onCancel,
}) => {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = code.trim();

    const valid = useBackupCode
      ? /^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/.test(value)
      : /^\d{6}$/.test(value);
    if (!valid) {
      setError(
        useBackupCode
          ? "Backup codes look like ABCD-1234."
          : "Enter the 6-digit code.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSubmit(value);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {useBackupCode ? (
        <FormField
          label="Backup code"
          name="backup_code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="ABCD-1234"
          maxLength={9}
          autoFocus
        />
      ) : (
        <CodeInput
          value={code}
          onChange={setCode}
          invalid={Boolean(error)}
          autoFocus
        />
      )}

      <Alert variant="danger">{error}</Alert>

      {allowBackupCode && (
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setUseBackupCode((value) => !value);
            setCode("");
            setError("");
          }}
        >
          {useBackupCode
            ? "Use the authenticator app instead"
            : "Use a backup code instead"}
        </button>
      )}

      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant={variant} loading={submitting}>
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
};

/**
 * Asks for a 2FA code before a sensitive action (disable 2FA, new backup codes).
 */
const CodeConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",
  tone = "default",
  allowBackupCode = false,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal show={show} title={title} icon="✦" tone={tone} onClose={onClose}>
      <p>{message}</p>
      <CodeConfirmForm
        allowBackupCode={allowBackupCode}
        confirmLabel={confirmLabel}
        variant={variant}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default CodeConfirmModal;
