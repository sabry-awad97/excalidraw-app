import { nanoid } from 'nanoid';
import { useRef, useState, useLayoutEffect } from 'react';
import rough from 'roughjs';
import { generateElement, getElementAtPosition } from './helpers';
import useEventListener from './hooks/useEventListener';
import { DrawnElement, ElementType } from './types';

interface Props {
  width?: number;
  height?: number;
}

const App: React.FC<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ElementType>('line');

  const [elements, setElements] = useState<DrawnElement[]>([]);
  const [action, setAction] = useState<'none' | 'drawing' | 'moving'>('none');
  const [selectedElement, setSelectedElement] = useState<
    (DrawnElement & { offsetX: number; offsetY: number }) | null
  >(null);

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
      const { clientX, clientY } = event;

      if (tool === 'selection') {
        const foundElement = getElementAtPosition(clientX, clientY, elements);
        if (foundElement) {
          setSelectedElement({
            ...foundElement,
            offsetX: clientX - foundElement.x1,
            offsetY: clientY - foundElement.y1,
          });
          setAction('moving');
        }
      } else {
        setAction('drawing');

        const element = generateElement(
          elements.length,
          clientX,
          clientY,
          clientX,
          clientY,
          tool
        );

        setElements(prev => prev.concat(element));
      }
    },
    canvasRef
  );

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    clientX: number,
    clientY: number,
    type: 'line' | 'rectangle'
  ) => {
    const updatedElement = generateElement(id, x1, y1, clientX, clientY, type);

    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  };

  useEventListener(
    'mousemove',
    event => {
      const { clientX, clientY } = event;
      if (action === 'drawing' && tool !== 'selection') {
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        updateElement(index, x1, y1, clientX, clientY, tool);
      }

      if (tool === 'selection') {
        const canvas = event.target as HTMLCanvasElement;
        canvas.style.cursor = getElementAtPosition(clientX, clientY, elements)
          ? 'move'
          : 'default';
      }

      if (action === 'moving' && selectedElement) {
        const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;

        const width = x2 - x1;
        const height = y2 - y1;

        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;

        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
      }
    },
    canvasRef
  );

  useEventListener(
    'mouseup',
    () => {
      setAction('none');
      setSelectedElement(null);
    },
    canvasRef
  );

  return (
    <div>
      <div style={{ position: 'fixed' }}>
        <input
          type="radio"
          id="selection"
          onChange={() => setTool('selection')}
          checked={tool === 'selection'}
        />
        <label htmlFor="selection">Selection</label>

        <input
          type="radio"
          id="line"
          onChange={() => setTool('line')}
          checked={tool === 'line'}
        />
        <label htmlFor="line">Line</label>

        <input
          type="radio"
          id="rectangle"
          onChange={() => setTool('rectangle')}
          checked={tool === 'rectangle'}
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
