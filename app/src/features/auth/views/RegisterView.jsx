import AuthLayout from "../../../shared/components/layout/AuthLayout";
import useAuth from "../context/useAuth";
import RegisterForm from "../components/RegisterForm";

const FEATURES = [
  { title: "One account", text: "Manage registrations and tickets." },
  { title: "Fast check-in", text: "Use a unique electronic ticket code." },
  { title: "Stay informed", text: "Updates are saved even while offline." },
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
      text="Discover local events, keep your tickets organized and receive real-time updates from organizers."
      features={FEATURES}
    >
      <RegisterForm onSubmit={handleRegister} />
    </AuthLayout>
  );
};

export default RegisterView;
