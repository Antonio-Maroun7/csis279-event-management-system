import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import * as authService from "../services/authServices";
import {
  getToken,
  setToken,
  SESSION_EXPIRED_EVENT,
} from "../../../shared/api/apiFetch";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // only wait for the API when there is a saved token to check
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // restore the session after a page refresh
  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    let cancelled = false;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // the API rejected the token (expired / deleted user) -> log out
  useEffect(() => {
    const handleExpired = () => setUser(null);

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    const result = await authService.login(email, password);
    setToken(result.token, remember);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // used after the profile is edited so the navbar shows the new name
  const updateUser = useCallback((nextUser) => setUser(nextUser), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
