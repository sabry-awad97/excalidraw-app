import { useState } from 'react';
import { DrawnElement } from '../types';

const useHistory = (initialState: DrawnElement[]) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (
    action: DrawnElement[] | ((prev: DrawnElement[]) => DrawnElement[]),
    overwrite = false
  ) => {
    const newState =
      typeof action === 'function' ? action(history[index]) : action;

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo] as const;
};

export default useHistory;
