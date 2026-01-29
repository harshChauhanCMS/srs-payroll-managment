import axios from "axios";
import axiosRetry from "axios-retry";

import { apiBaseUrl } from ".";
import { logger } from "@/utils/logger";
import { getAuthTokens } from "@/utils/storage";

const apiInstance = () => {
  const baseURL = apiBaseUrl || (typeof window !== "undefined" ? "" : "http://localhost:3000");
  const api = axios.create({
    baseURL,
  });

  axiosRetry(api, { retries: 3 });

  api.interceptors.request.use(async (config) => {
    const tokens = getAuthTokens();
    const accessToken = tokens?.accessToken;
    config.xsrfCookieName = "token";

    // If access-token header is provided (e.g., from MSG91), use it
    // Otherwise, use the stored access token
    if (config.headers["access-token"]) {
      // access-token header is already set, keep it
    } else if (accessToken) {
      config.headers["authorization"] = `Bearer ${accessToken}`;
    }
    logger.log("REQUEST", config);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      logger.log(response);
      console.log(response.data);
      // Handle token updates if needed
      if (response.data?.tokens?.accessToken) {
        // Token was refreshed, update storage
        const { setAuthTokens } = require("@/utils/storage");
        setAuthTokens(response.data.tokens);
      }
      return response;
    },
    (error) => {
      logger.log("ERROR", error.response?.data?.detail || error.message);
      throw error;
    }
  );

  return api;
};

const apiClient = apiInstance();

export default apiClient;
