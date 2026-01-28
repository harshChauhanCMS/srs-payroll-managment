// export const apiBaseUrl = "http://localhost:5970/api/v1";
export const apiBaseUrl = "https://13-60-62-223.nip.io/api/v1";

export const apiUrls = {
  auth: {
    getOtp: "/otp/send",
    login: "/auth/admin",
    statistics: "/auth/statistics",
    toggleStatus: "/auth/toggle-profile-status",
    getAllPublics: "/auth/publics",
    getAllClerks: "/auth/clerks",
    getById: "/auth",
    getAllUsers: "/auth/all",
    deleteUser: "/auth/delete/id",
  },
  lawyers: {
    getAllLawyers: "/lawyers",
    getLawyerById: "/lawyers",
  },
  askMeAnything: {
    getComments: "/ask-me-anything/",
    hideComments: "/ask-me-anything/id/hide/id",
    hidePost: "ask-me-anything/id/hide",
  },
  vahGram: {
    getComments: "/posts",
    hideComments: "posts/id/hide/id",
    hidePost: "posts/id/hide",
  },
  blogs: {
    getAllBlogs: "/blogs",
    getBlogById: "/blogs/id",
    verifyBlog: "/blogs/id/verify",
    deleteBlog: "/blogs/id",
  },
  notifications: {
    sendNotification: "/notifications/send-bulk-notification",
  },
};
