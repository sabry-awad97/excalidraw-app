import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import useEventListener from './useEventListener';

const generator = rough.generator();

const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    const roughCanvas = rough.canvas(canvas);
    const rect = generator.rectangle(10, 10, 100, 100);
    const line = generator.line(10, 10, 110, 110);
    roughCanvas.draw(rect);
    roughCanvas.draw(line);
  }, []);

  useEventListener(
    'mousedown',
    () => {
      setIsDrawing(true);
    },
    canvasRef
  );

  useEventListener(
    'mousemove',
    () => {
      if (!isDrawing) return;
    },
    canvasRef
  );

  useEventListener(
    'mouseup',
    () => {
      setIsDrawing(false);
    },
    canvasRef
  );

  return canvasRef;
};

export default useCanvas;
