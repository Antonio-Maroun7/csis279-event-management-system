import { useContext } from "react";
import AuthContext from "./AuthContext";

/**
 * Gives any component access to the logged-in user and the auth actions.
 * const { user, login, logout } = useAuth();
 */
const useAuth = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return auth;
};

export default useAuth;
