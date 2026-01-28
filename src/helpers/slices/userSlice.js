import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    tokens: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearUser: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
    updateTokens: (state, action) => {
      state.tokens = { ...state.tokens, ...action.payload };
    },
  },
});

export const { setUser, updateUser, clearUser, updateTokens } =
  userSlice.actions;
export default userSlice.reducer;
