/**
 * Explains how 2FA works (when off) or confirms the app is connected (when on).
 */
const AuthenticatorInfoCard = ({ enabled }) => {
  if (enabled) {
    return (
      <section className="card card-pad">
        <div className="eyebrow">AUTHENTICATOR</div>
        <h3 className="card-title">Your app is connected</h3>
        <p className="subtitle">
          Each time you sign in, EventFlow asks for the 6-digit code from your
          app after your password.
        </p>
        <ul className="steps">
          <li>Codes change every 30 seconds.</li>
          <li>Changing phones? Disable 2FA first, then set it up again.</li>
          <li>Lost your phone? Sign in with a backup code.</li>
        </ul>
      </section>
    );
  }

  return (
    <section className="card card-pad">
      <div className="eyebrow">HOW IT WORKS</div>
      <h3 className="card-title">Three quick steps</h3>
      <ol className="steps">
        <li>Install an authenticator app (Google Authenticator, Authy...).</li>
        <li>Click “Set up 2FA” and scan the QR code.</li>
        <li>Type the 6-digit code from the app and save your backup codes.</li>
      </ol>
      <div className="notice notice-info mt-3">
        Even if someone learns your password, they cannot sign in without your
        phone.
      </div>
    </section>
  );
};

export default AuthenticatorInfoCard;
