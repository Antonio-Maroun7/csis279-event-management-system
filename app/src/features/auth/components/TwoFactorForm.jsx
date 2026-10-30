import { useState } from "react";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import CodeInput from "../../../shared/components/ui/CodeInput";
import FormField from "../../../shared/components/ui/FormField";

const TOTP_CODE = /^\d{6}$/;
const BACKUP_CODE = /^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/;

/**
 * Second login step: 6-digit authenticator code, or a backup code.
 * onSubmit(code) does the API call.
 */
const TwoFactorForm = ({ onSubmit, onCancel }) => {
  const [useBackupCode, setUseBackupCode] = useState(false); // Tracks whether the user is using a backup code or the authenticator app
  const [code, setCode] = useState(""); // Stores the current input code, either TOTP or backup code
  const [error, setError] = useState(""); // Stores the current error message, if any
  const [submitting, setSubmitting] = useState(false); // Tracks whether the form is currently being submitted

  const switchMode = () => {
    // Switches between using the authenticator app and backup code
    setUseBackupCode((value) => !value);
    setCode("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = code.trim();

    if (!useBackupCode && !TOTP_CODE.test(value)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (useBackupCode && !BACKUP_CODE.test(value)) {
      setError("Backup codes look like ABCD-1234.");
      return;
    }

    try {
      setSubmitting(true); // Marks the form as submitting
      setError("");
      await onSubmit(value);
      // on success the page changes, so nothing else to do here
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="eyebrow">TWO-FACTOR AUTHENTICATION</div>
      <h2>Verify your identity</h2>
      <p className="subtitle">
        {useBackupCode
          ? "Enter one of the backup codes you saved when you turned on 2FA."
          : "Open your authenticator app and enter the 6-digit code for EventFlow."}
      </p>

      <Alert variant="danger" onClose={() => setError("")}>
        {error}
      </Alert>

      {useBackupCode ? (
        <FormField
          label="Backup code"
          name="backup_code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="ABCD-1234"
          maxLength={9}
          autoComplete="off"
          autoFocus
        />
      ) : (
        <CodeInput
          value={code}
          onChange={setCode}
          autoFocus
          invalid={Boolean(error)}
        />
      )}

      <Button type="submit" full loading={submitting}>
        {submitting ? "Verifying..." : "Verify & continue"}
      </Button>
      <Button
        variant="ghost"
        full
        className="mt-2"
        onClick={switchMode}
        disabled={submitting}
      >
        {useBackupCode ? "Use the authenticator app" : "Use a backup code"}
      </Button>

      <div className="notice notice-info mt-3">
        Your code is never stored in plain text and expires automatically.
      </div>

      <p className="auth-switch mt-3">
        Wrong account?{" "}
        <button type="button" className="link-button" onClick={onCancel}>
          Back to sign in
        </button>
      </p>
    </form>
  );
};

export default TwoFactorForm;
