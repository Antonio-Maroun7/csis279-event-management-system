import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";

/**
 * Security section of the profile: 2FA status and password change.
 */
const SecurityCard = ({ user, onChangePassword }) => {
  const enabled = user.two_factor_enabled;

  return (
    <section className="card card-pad">
      <div className="eyebrow">SECURITY</div>

      <div className="security-row">
        <div className="security-icon">✦</div>
        <div>
          <b>Two-factor authentication</b>
          <div className="small mt-1">
            {enabled ? "Enabled with authenticator app" : "Not enabled yet"}
          </div>
        </div>
        <Badge color={enabled ? "green" : "slate"}>
          {enabled ? "On" : "Off"}
        </Badge>
      </div>

      <div className="security-row">
        <div className="security-icon">⚿</div>
        <div>
          <b>Password</b>
          <div className="small mt-1">
            Change the password you use to sign in.
          </div>
        </div>
      </div>

      <div className="card-actions">
        <Button variant="secondary" to="/security">
          Open security settings
        </Button>
        <Button variant="ghost" onClick={onChangePassword}>
          Change password
        </Button>
      </div>

      {enabled ? (
        <div className="notice notice-success mt-3">
          Your account has an additional verification step enabled.
        </div>
      ) : (
        <div className="notice notice-info mt-3">
          Turn on two-factor authentication to protect your account with a
          second step.
        </div>
      )}
    </section>
  );
};

export default SecurityCard;
