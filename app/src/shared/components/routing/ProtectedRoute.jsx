import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import Spinner from "../ui/Spinner";

/**
 * Wraps routes that need a logged-in user.
 * <Route element={<ProtectedRoute />}>                    any logged-in user
 * <Route element={<ProtectedRoute roles={["admin"]} />}>  only some roles
 */
const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth(); // get the current user and loading state
  const location = useLocation(); // get the current location

  if (loading) {
    return (
      <div className="page-loader">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (!user) {
    // if there is no user, redirect to login
    // remember where the user was going, so login can send them back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    // if the user doesn't have the required role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
