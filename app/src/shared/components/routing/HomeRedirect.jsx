import { Navigate } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import { getHomePath } from "../../config/roles";

/**
 * "/" sends each role to its own home page.
 */
const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user.role)} replace />;
};

export default HomeRedirect;
