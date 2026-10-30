import { useState } from "react";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import CodeInput from "../../../shared/components/ui/CodeInput";

/**
 * The user types the first code from the app to prove the setup worked.
 * onConfirm(code) calls the API; if it throws, the message is shown here.
 */
const ConfirmSetupCard = ({ onConfirm }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code shown in your app.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onConfirm(code);
    } catch (err) {
      setError(err.message);
      setCode("");
      setSubmitting(false);
    }
  };

  return (
    <section className="card card-pad">
      <div className="eyebrow">VERIFY</div>
      <h3 className="card-title">Confirm a 6-digit code</h3>
      <p className="subtitle">
        Enter a code from your authenticator app to confirm setup.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <CodeInput
          value={code}
          onChange={setCode}
          invalid={Boolean(error)}
          autoFocus
        />
        <Alert variant="danger">{error}</Alert>
        <Button type="submit" full loading={submitting}>
          Verify code
        </Button>
      </form>

      <p className="small mt-3">
        After this step you will get 10 one-time backup codes. Keep them
        somewhere safe.
      </p>
    </section>
  );
};

export default ConfirmSetupCard;
