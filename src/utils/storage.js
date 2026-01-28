// localStorage utility functions

export const setLocalStorage = (key, value) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Error getting localStorage:", error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Error removing localStorage:", error);
  }
};

export const clearLocalStorage = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Specific functions for authentication
export const setAuthTokens = (tokens) => {
  setLocalStorage("auth_tokens", tokens);
};

export const getAuthTokens = () => {
  return getLocalStorage("auth_tokens", null);
};

export const setUserData = (user) => {
  setLocalStorage("user_data", user);
};

export const getUserData = () => {
  return getLocalStorage("user_data", null);
};

export const clearAuthData = () => {
  removeLocalStorage("auth_tokens");
  removeLocalStorage("user_data");
};
