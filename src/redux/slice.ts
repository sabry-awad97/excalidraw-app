import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DrawnElement } from '../types';

const initialState = {
  isDrawing: false,
  drawnElements: [] as DrawnElement[],
};

const slice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
    updateDrawnElements: (state, action: PayloadAction<DrawnElement[]>) => {
      state.drawnElements = action.payload;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
