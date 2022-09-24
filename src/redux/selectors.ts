import { RootState } from './store';
import { createSelector } from '@reduxjs/toolkit';

const selectState = (state: RootState) => state;

export const getIsDrawing = createSelector(
  [selectState],
  ({ isDrawing }) => isDrawing
);
