import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import { getHomePath } from "../../config/roles";

/**
 * Login and register pages: once the user is logged in, send them to the page
 * they were trying to reach (remembered by ProtectedRoute), or to their home page.
 */
const GuestRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (user) {
    const target = location.state?.from?.pathname || getHomePath(user.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
