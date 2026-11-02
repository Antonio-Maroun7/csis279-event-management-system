import AuthLayout from "../../../shared/components/layout/AuthLayout";
import useAuth from "../context/useAuth";
import RegisterForm from "../components/RegisterForm";

const FEATURES = [
  { title: "One account", text: "Manage your profile in one place." },
  { title: "Find events", text: "Search by title, category or city." },
  { title: "Secure access", text: "Protect your account with optional 2FA." },
];

const RegisterView = () => {
  const { register } = useAuth();

  // the backend logs the new user in; GuestRoute then redirects
  const handleRegister = async ({ first_name, last_name, email, password }) => {
    await register({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <AuthLayout
      eyebrow="JOIN THE EXPERIENCE"
      title="Your next event starts here."
      text="Discover local events, filter them by category or city and see how many seats are left."
      features={FEATURES}
    >
      <RegisterForm onSubmit={handleRegister} />
    </AuthLayout>
  );
};

export default RegisterView;
