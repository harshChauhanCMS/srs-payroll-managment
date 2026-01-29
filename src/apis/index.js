export const apiBaseUrl =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "";

export const apiUrls = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
  },
};
