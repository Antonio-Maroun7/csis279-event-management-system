import ApiError from "./ApiError";
import handleResponse from "./handleResponse";

// set in app/.env (falls back to the default API address)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "token";

// fired when the API rejects the token, so the app can send the user back to login
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// storage can be blocked (private mode, disabled cookies), so never let it throw
const readToken = (storage) => {
  try {
    return storage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getToken = () =>
  readToken(localStorage) || readToken(sessionStorage);

/**
 * Saves the token.
 * remember = true  -> localStorage (stays after closing the browser)
 * remember = false -> sessionStorage (removed when the tab is closed)
 */
export const setToken = (token, remember = true) => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    if (token) {
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    }
  } catch {
    // the user just stays logged in for this page only
  }
};

/**
 * fetch wrapper used by every service:
 * - prefixes the API base URL
 * - sends the JSON body and the login token
 * - returns the parsed JSON or throws an ApiError
 *
 * Example: apiFetch("/users/me", { method: "PUT", body: { first_name: "Antonio" } })
 */
const apiFetch = async (path, { body, headers, ...options } = {}) => {
  const token = getToken();
  const hasBody = body !== undefined;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(hasBody && { "Content-Type": "application/json" }), // add the Content-Type header if there is a body
        ...(token && { Authorization: `Bearer ${token}` }), // add the Authorization header if the token exists
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined, // stringify the body if it exists
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?");
  }

  if (response.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  return handleResponse(response);
};

export default apiFetch;
