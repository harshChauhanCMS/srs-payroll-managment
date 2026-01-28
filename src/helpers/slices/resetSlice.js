import { createSlice } from "@reduxjs/toolkit";

const resetSlice = createSlice({
  name: "reset",
  initialState: {},
  reducers: {
    resetStore: (state) => {
      // This will be handled in the rootReducer; no state changes here
    },
  },
});

export const { resetStore } = resetSlice.actions;
export default resetSlice.reducer;
