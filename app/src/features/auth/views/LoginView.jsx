import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../shared/components/layout/AuthLayout";
import useAuth from "../context/useAuth";
import LoginForm from "../components/LoginForm";

const FEATURES = [
  { title: "Seat availability", text: "See how many seats are left." },
  { title: "Secure access", text: "Role-based access and optional 2FA." },
  { title: "Easy management", text: "Organizers publish and manage events." },
];

const LoginView = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password, remember }) => {
    const result = await login(email.trim(), password, remember);

    // 2FA on: go to the code page (keep "from" so we can return there after)
    if (result.requiresTwoFactor) {
      navigate("/2fa", { state: location.state });
    }
    // otherwise GuestRoute redirects automatically once the user is set
  };

  return (
    <AuthLayout
      eyebrow="EVENT MANAGEMENT"
      title="Everything your event needs, in one place."
      text="Create, discover and manage memorable events with clear seat availability and secure, role-based access."
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
