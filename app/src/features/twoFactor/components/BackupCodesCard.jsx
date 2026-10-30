import Button from "../../../shared/components/ui/Button";

/**
 * How many backup codes are left + a button to create new ones.
 */
const BackupCodesCard = ({ remaining, onRegenerate }) => {
  const low = remaining <= 3;

  return (
    <section className="card card-pad">
      <div className="eyebrow">BACKUP CODES</div>
      <h3 className="card-title">One-time recovery codes</h3>
      <p className="subtitle">
        Use a backup code to sign in if you lose access to your authenticator
        app.
      </p>

      <div className="backup-count">{remaining}</div>
      <div className="small">of 10 codes left</div>

      {low && (
        <div className="notice notice-danger mt-3">
          You are running out of backup codes. Generate new ones.
        </div>
      )}

      <Button variant="ghost" className="mt-3" onClick={onRegenerate}>
        Generate new backup codes
      </Button>
    </section>
  );
};

export default BackupCodesCard;
