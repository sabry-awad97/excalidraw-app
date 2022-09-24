import { bindActionCreators } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { actions } from './slice';

import type { RootState, AppDispatch } from './store';

const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useActions = () => {
  const dispatch = useAppDispatch();
  return useMemo(() => bindActionCreators(actions, dispatch), [dispatch]);
};
