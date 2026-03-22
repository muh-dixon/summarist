import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/features/authSlice";
import libraryReducer from "@/redux/features/librarySlice";
import uiReducer from "@/redux/features/uiSlice";
import playerReducer from "@/redux/features/playerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    library: libraryReducer,
    ui: uiReducer,
    player: playerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
