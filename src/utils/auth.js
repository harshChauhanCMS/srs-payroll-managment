import { getAuthTokens, getUserData } from "./storage";

// Initialize authentication state from localStorage
export const initializeAuth = () => {
  const tokens = getAuthTokens();
  const user = getUserData();

  return {
    user,
    tokens,
    isAuthenticated: !!(user && tokens?.accessToken),
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const { user, tokens } = initializeAuth();
  return !!(user && tokens?.accessToken);
};

// Get authorization header for API requests
export const getAuthHeader = () => {
  const tokens = getAuthTokens();
  if (tokens?.accessToken) {
    return {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
  };
};
