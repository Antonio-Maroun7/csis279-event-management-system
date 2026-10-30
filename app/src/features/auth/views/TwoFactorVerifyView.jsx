import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../../shared/components/layout/AuthLayout";
import useAuth from "../context/useAuth";
import TwoFactorForm from "../components/TwoFactorForm";

const FEATURES = [
  { title: "Time-based codes", text: "Codes refresh automatically." },
  { title: "Backup access", text: "Use a backup code if needed." },
  { title: "Protected roles", text: "Recommended for organizers and admins." },
];

const TwoFactorVerifyView = () => {
  const { pendingTwoFactor, verifyTwoFactor, cancelTwoFactor } = useAuth();
  const navigate = useNavigate();

  // opened directly (or after a refresh): start from the login page
  if (!pendingTwoFactor) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (code) => {
    const result = await verifyTwoFactor(code);

    // a backup code was used: send the user to the security page to fix their setup
    if (result.used_backup_code) {
      navigate("/security", {
        replace: true,
        state: {
          usedBackupCode: true,
          backupCodesLeft: result.backup_codes_left,
        },
      });
    }
    // otherwise GuestRoute redirects to the home page automatically
  };

  const handleCancel = () => {
    cancelTwoFactor();
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout
      eyebrow="EXTRA SECURITY"
      title="One more step keeps your account protected."
      text="Enter the current six-digit code from your authenticator app. This step appears only for accounts with two-factor authentication enabled."
      features={FEATURES}
    >
      <TwoFactorForm onSubmit={handleVerify} onCancel={handleCancel} />
    </AuthLayout>
  );
};

export default TwoFactorVerifyView;
