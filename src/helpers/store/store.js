import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import userSlice from "../slices/userSlice";
import resetSlice from "../slices/resetSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Only persist user data
  blacklist: ["_persist"],
};

const appReducer = combineReducers({
  user: userSlice,
  reset: resetSlice,
});

const rootReducer = (state, action) => {
  if (action.type === "reset/resetStore") {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export { store };
export default store;
