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
  // password was correct but a 2FA code is still needed: { tempToken, remember }
  const [pendingTwoFactor, setPendingTwoFactor] = useState(null);

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

  /**
   * Step 1 of the login. Returns { requiresTwoFactor: true } when a code is needed.
   */
  const login = useCallback(async (email, password, remember = true) => {
    const result = await authService.login(email, password);

    if (result.requires_two_factor) {
      setPendingTwoFactor({ tempToken: result.temp_token, remember });
      return { requiresTwoFactor: true };
    }

    setToken(result.token, remember);
    setUser(result.user);
    return { requiresTwoFactor: false, user: result.user };
  }, []);

  /**
   * Step 2 of the login (only when 2FA is on): checks the 6-digit or backup code.
   */
  const verifyTwoFactor = useCallback(
    async (code) => {
      if (!pendingTwoFactor) {
        throw new Error("Your sign-in session expired. Please sign in again.");
      }

      const result = await authService.verifyTwoFactor(
        pendingTwoFactor.tempToken,
        code,
      );
      setToken(result.token, pendingTwoFactor.remember);
      setPendingTwoFactor(null);
      setUser(result.user);
      return result;
    },
    [pendingTwoFactor],
  );

  // "Back to sign in" on the 2FA page
  const cancelTwoFactor = useCallback(() => setPendingTwoFactor(null), []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setPendingTwoFactor(null);
    setUser(null);
  }, []);

  // used after the profile or the 2FA status changes so every page shows the new data
  const updateUser = useCallback((nextUser) => setUser(nextUser), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pendingTwoFactor,
      login,
      verifyTwoFactor,
      cancelTwoFactor,
      register,
      logout,
      updateUser,
    }),
    [
      user,
      loading,
      pendingTwoFactor,
      login,
      verifyTwoFactor,
      cancelTwoFactor,
      register,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
