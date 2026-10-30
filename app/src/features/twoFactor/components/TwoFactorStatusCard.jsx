import Button from "../../../shared/components/ui/Button";

/**
 * Top card of the security page: 2FA status and the main action.
 */
const TwoFactorStatusCard = ({
  enabled,
  recommended,
  settingUp,
  starting,
  onSetup,
  onCancelSetup,
  onDisable,
}) => {
  return (
    <section className="card security-card">
      <div className="security-icon">✦</div>
      <div>
        <b>Two-factor authentication</b>
        <div className="small mt-1">
          Status:{" "}
          <span className={enabled ? "status-on" : "status-off"}>
            {enabled ? "Enabled" : "Not enabled"}
          </span>{" "}
          • Authenticator app
        </div>
        {!enabled && recommended && (
          <div className="small mt-1">
            Recommended for organizer and admin accounts.
          </div>
        )}
      </div>

      {enabled ? (
        <Button variant="danger" onClick={onDisable}>
          Disable 2FA
        </Button>
      ) : settingUp ? (
        <Button variant="ghost" onClick={onCancelSetup}>
          Cancel setup
        </Button>
      ) : (
        <Button onClick={onSetup} loading={starting}>
          Set up 2FA
        </Button>
      )}
    </section>
  );
};

export default TwoFactorStatusCard;
