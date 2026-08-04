/**
 * @file store.js
 * @description Configures and exports the Redux Toolkit store.
 * Registers the auth reducer as the sole slice for global authentication state.
 */
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
