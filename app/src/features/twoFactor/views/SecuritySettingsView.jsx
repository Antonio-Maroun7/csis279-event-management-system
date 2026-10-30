import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../../auth/context/useAuth";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Spinner from "../../../shared/components/ui/Spinner";
import TwoFactorStatusCard from "../components/TwoFactorStatusCard";
import AuthenticatorSetupCard from "../components/AuthenticatorSetupCard";
import ConfirmSetupCard from "../components/ConfirmSetupCard";
import AuthenticatorInfoCard from "../components/AuthenticatorInfoCard";
import BackupCodesCard from "../components/BackupCodesCard";
import BackupCodesModal from "../components/BackupCodesModal";
import CodeConfirmModal from "../components/CodeConfirmModal";
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  regenerateBackupCodes,
  startTwoFactorSetup,
} from "../services/twoFactorService";

const SecuritySettingsView = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();

  const [status, setStatus] = useState(null); // { enabled, backup_codes_left }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [setupData, setSetupData] = useState(null); // { qr_code, secret } while setting up
  const [starting, setStarting] = useState(false);
  const [backupCodes, setBackupCodes] = useState(null); // codes shown once in a dialog
  const [codeAction, setCodeAction] = useState(null); // "disable" | "regenerate"

  // shown after signing in with a backup code (sent by TwoFactorVerifyView)
  const usedBackupCode = location.state?.usedBackupCode;
  const backupCodesLeft = location.state?.backupCodesLeft;

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const data = await getTwoFactorStatus();
        if (!cancelled) setStatus(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStartSetup = async () => {
    try {
      setStarting(true);
      setError("");
      setSuccess("");
      const data = await startTwoFactorSetup();
      setSetupData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  // errors are shown inside ConfirmSetupCard (it catches what we throw)
  const handleEnable = async (code) => {
    const result = await enableTwoFactor(code);
    setSetupData(null);
    setStatus({ enabled: true, backup_codes_left: result.backup_codes.length });
    updateUser(result.user);
    setBackupCodes(result.backup_codes);
    setSuccess("Two-factor authentication is now enabled.");
  };

  // errors are shown inside CodeConfirmModal
  const handleCodeAction = async (code) => {
    if (codeAction === "disable") {
      const result = await disableTwoFactor(code);
      updateUser(result.user);
      setStatus({ enabled: false, backup_codes_left: 0 });
      setSuccess("Two-factor authentication was turned off.");
    } else {
      const result = await regenerateBackupCodes(code);
      setStatus({
        enabled: true,
        backup_codes_left: result.backup_codes.length,
      });
      setBackupCodes(result.backup_codes);
      setSuccess("New backup codes were created. The old ones no longer work.");
    }
    setCodeAction(null);
  };

  return (
    <div className="page-narrow">
      <PageHeader
        eyebrow="ACCOUNT SECURITY"
        title="Security settings"
        subtitle="Protect your EventFlow account with two-factor authentication."
        actions={
          <Button variant="ghost" to="/profile">
            ← Back to profile
          </Button>
        }
      />

      {usedBackupCode && status?.enabled && (
        <Alert variant="info" className="mb-3">
          You signed in with a backup code ({backupCodesLeft} left). If you lost
          your phone, disable 2FA and set it up again, or generate new backup
          codes.
        </Alert>
      )}
      <Alert variant="danger" onClose={() => setError("")} className="mb-3">
        {error}
      </Alert>
      <Alert variant="success" onClose={() => setSuccess("")} className="mb-3">
        {success}
      </Alert>

      {loading ? (
        <div className="card">
          <Spinner label="Loading security settings..." />
        </div>
      ) : (
        status && (
          <>
            <TwoFactorStatusCard
              enabled={status.enabled}
              recommended={user.role !== "attendee"}
              settingUp={Boolean(setupData)}
              starting={starting}
              onSetup={handleStartSetup}
              onCancelSetup={() => setSetupData(null)}
              onDisable={() => setCodeAction("disable")}
            />

            <div className="grid grid-2 mt-4">
              {setupData ? (
                <>
                  <AuthenticatorSetupCard
                    qrCode={setupData.qr_code}
                    secret={setupData.secret}
                  />
                  <ConfirmSetupCard onConfirm={handleEnable} />
                </>
              ) : (
                <>
                  <AuthenticatorInfoCard enabled={status.enabled} />
                  {status.enabled && (
                    <BackupCodesCard
                      remaining={status.backup_codes_left}
                      onRegenerate={() => setCodeAction("regenerate")}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )
      )}

      <BackupCodesModal
        codes={backupCodes}
        onClose={() => setBackupCodes(null)}
      />

      <CodeConfirmModal
        show={codeAction === "disable"}
        title="Disable two-factor authentication?"
        message="Enter a code from your authenticator app (or a backup code). After this, only your password will be needed to sign in."
        confirmLabel="Disable 2FA"
        variant="danger-solid"
        tone="danger"
        allowBackupCode
        onSubmit={handleCodeAction}
        onClose={() => setCodeAction(null)}
      />
      <CodeConfirmModal
        show={codeAction === "regenerate"}
        title="Generate new backup codes?"
        message="Enter a code from your authenticator app. Your old backup codes will stop working."
        confirmLabel="Generate codes"
        onSubmit={handleCodeAction}
        onClose={() => setCodeAction(null)}
      />
    </div>
  );
};

export default SecuritySettingsView;
