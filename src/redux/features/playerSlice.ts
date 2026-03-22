import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  currentBookId: string | null;
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
}

const initialState: PlayerState = {
  currentBookId: null,
  isPlaying: false,
  playbackRate: 1,
  currentTime: 0,
  duration: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentBook(state, action: PayloadAction<string | null>) {
      state.currentBookId = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setPlaybackRate(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    resetPlayer(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCurrentBook,
  setIsPlaying,
  setPlaybackRate,
  setCurrentTime,
  setDuration,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
