import { RootState } from './store';
import { createSelector } from '@reduxjs/toolkit';

const selectState = (state: RootState) => state;

export const selectIsDrawing = createSelector(
  [selectState],
  ({ isDrawing }) => isDrawing
);

export const selectDrawnElements = createSelector(
  [selectState],
  ({ drawnElements }) => drawnElements
);
