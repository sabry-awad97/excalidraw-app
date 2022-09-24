import { useRef, useState, useLayoutEffect } from 'react';
import rough from 'roughjs';
import { generateElement } from './helpers/generateElement';
import useEventListener from './hooks/useEventListener';
import { Drawable, ElementType } from './types';

interface Props {
  width?: number;
  height?: number;
}

const App: React.FC<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elementType, setElementType] = useState<ElementType>('line');

  const [elements, setElements] = useState<
    {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      roughElement: Drawable;
    }[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    for (const element of elements) {
      roughCanvas.draw(element.roughElement);
    }
  }, [elements]);

  useEventListener(
    'mousedown',
    event => {
      setIsDrawing(true);

      const { clientX, clientY } = event;

      const element = generateElement(
        clientX,
        clientY,
        clientX,
        clientY,
        elementType
      );

      setElements(prev => prev.concat(element));
    },
    canvasRef
  );

  useEventListener(
    'mousemove',
    event => {
      if (!isDrawing) return;
      const { clientX, clientY } = event;

      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      const element = generateElement(x1, y1, clientX, clientY, elementType);

      setElements(prev => {
        const copy = [...prev];
        copy[index] = element;
        return copy;
      });
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

  return (
    <div>
      <div style={{ position: 'fixed' }}>
        <input type="radio" id="selection" />
        <label htmlFor="selection">Selection</label>

        <input
          type="radio"
          id="line"
          onChange={() => setElementType('line')}
          checked={elementType === 'line'}
        />
        <label htmlFor="line">Line</label>

        <input
          type="radio"
          id="rectangle"
          onChange={() => setElementType('rectangle')}
          checked={elementType === 'rectangle'}
        />
        <label htmlFor="rectangle">Rectangle</label>

        <input type="radio" id="pencil" />
        <label htmlFor="pencil">Pencil</label>
        <input type="radio" id="text" />
        <label htmlFor="text">Text</label>
      </div>
      <div style={{ position: 'fixed', bottom: 0, padding: 10 }}>
        <button>Undo</button>
        <button>Redo</button>
      </div>
      <canvas
        ref={canvasRef}
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      >
        Canvas
      </canvas>
    </div>
  );
};

App.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export default App;
