import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Line } from '../types';

const initialState = {
  isDrawing: false,
  drawnElements: [] as Line[],
};

const slice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
    updateDrawnElements: (state, action: PayloadAction<Line[]>) => {
      state.drawnElements = action.payload;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
