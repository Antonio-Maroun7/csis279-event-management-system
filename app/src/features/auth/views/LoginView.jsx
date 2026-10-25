import { useLocation } from "react-router-dom";
import AuthLayout from "../../../shared/components/layout/AuthLayout";
import useAuth from "../context/useAuth";
import LoginForm from "../components/LoginForm";

const FEATURES = [
  { title: "Live availability", text: "Seat counts update without refresh." },
  { title: "Secure access", text: "Role-based access and optional 2FA." },
  { title: "Instant alerts", text: "Never miss an important update." },
];

const LoginView = () => {
  const { login } = useAuth();
  const location = useLocation();

  // GuestRoute redirects automatically once the user is set
  const handleLogin = async ({ email, password, remember }) => {
    await login(email.trim(), password, remember);
  };

  return (
    <AuthLayout
      eyebrow="REAL-TIME EVENT MANAGEMENT"
      title="Everything your event needs, in one place."
      text="Create, discover and manage memorable events with live seat updates, secure tickets and instant notifications."
      features={FEATURES}
    >
      <LoginForm
        onSubmit={handleLogin}
        notice={location.state?.from ? "Please sign in to continue." : ""}
      />
    </AuthLayout>
  );
};

export default LoginView;
