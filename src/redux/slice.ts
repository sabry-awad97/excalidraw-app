import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  isDrawing: false,
};

const slice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    updatIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
