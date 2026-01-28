import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/helpers/slices/userSlice";
import { clearAuthData } from "@/utils/storage";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, tokens, isAuthenticated } = useSelector((state) => state.user);

  const logout = () => {
    // Clear Redux store
    dispatch(clearUser());

    // Clear localStorage
    clearAuthData();
  };

  const getAccessToken = () => {
    return tokens?.accessToken || null;
  };

  const getRefreshToken = () => {
    return tokens?.refreshToken || null;
  };

  const isTokenExpired = () => {
    if (!tokens?.accessToken) return true;

    try {
      const token = tokens.accessToken;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  return {
    user,
    tokens,
    isAuthenticated,
    logout,
    getAccessToken,
    getRefreshToken,
    isTokenExpired,
  };
};
