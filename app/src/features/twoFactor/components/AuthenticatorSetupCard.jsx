/**
 * Shows the QR code to scan and the key to type by hand.
 */
const AuthenticatorSetupCard = ({ qrCode, secret }) => {
  // "JBSW Y3DP EHPK 3PXP" is easier to read than one long string
  const groupedSecret = secret.match(/.{1,4}/g).join(" ");

  return (
    <section className="card card-pad">
      <div className="eyebrow">SETUP</div>
      <h3 className="card-title">Authenticator app</h3>
      <p className="subtitle">
        Scan the QR code with Google Authenticator, Microsoft Authenticator,
        Authy, or another TOTP app.
      </p>

      <div className="qr-wrap">
        <img
          className="qr-image"
          src={qrCode}
          alt="QR code to add EventFlow to your authenticator app"
        />
      </div>

      <div className="label">Manual setup key</div>
      <div className="notice notice-info setup-key">{groupedSecret}</div>
    </section>
  );
};

export default AuthenticatorSetupCard;
