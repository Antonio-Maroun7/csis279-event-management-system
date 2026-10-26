import useAuth from "../../../features/auth/context/useAuth";
import AppLayout from "./AppLayout";
import DashboardLayout from "./DashboardLayout";

/**
 * Attendees get the top-bar layout, organizers and admins get the sidebar layout.
 */
const RoleLayout = () => {
  const { user } = useAuth();
  return user.role === "attendee" ? <AppLayout /> : <DashboardLayout />;
};

export default RoleLayout;
