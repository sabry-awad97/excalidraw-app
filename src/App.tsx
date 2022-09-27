import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';

import {
  adjustElementCoords,
  adjustmentRequired,
  cursorForPosition,
  drawElement,
  generateElement,
  getElementAtPosition,
  resizedCoordinates,
} from './helpers';
import useEventListener from './hooks/useEventListener';
import useHistory from './hooks/useHistory';
import { SelectedElement, Tool } from './types';

interface Props {
  width?: number;
  height?: number;
}

const App: React.FC<Props> = () => {
  type ActionTypes = 'none' | 'drawing' | 'moving' | 'resizing';

  const [action, setAction] = useState<ActionTypes>('none');
  const [elements, setElements, undo, redo] = useHistory([]);
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
  const [tool, setTool] = useState<Tool>(Tool.PENCIL);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    for (const element of elements) {
      drawElement(roughCanvas, context, element);
    }
  }, [elements]);

  useEventListener('keydown', event => {
    const { key, ctrlKey, shiftKey } = event;
    ctrlKey && (key === 'z' ? undo() : shiftKey && key === 'Z' ? redo() : null);
  });

  useEventListener(
    'mousedown',
    event => {
      const { clientX, clientY } = event;

      if (tool === 'selection') {
        const foundElement = getElementAtPosition(clientX, clientY, elements);
        if (foundElement) {
          switch (foundElement.type) {
            case Tool.LINE:
            case Tool.RECTANGLE:
              setSelectedElement({
                ...foundElement,
                offsetX: clientX - foundElement.x1,
                offsetY: clientY - foundElement.y1,
              });
              break;
            case Tool.PENCIL:
              const { points } = foundElement;

              setSelectedElement({
                ...foundElement,
                xOffsets: points.map(point => clientX - point.x),
                yOffsets: points.map(point => clientY - point.y),
              });
          }

          setElements(prev => prev);

          if (foundElement.position === 'inside') {
            setAction('moving');
          } else if (foundElement.position != null) {
            setAction('resizing');
          }
        }
      } else {
        const element = generateElement(
          elements.length,
          clientX,
          clientY,
          clientX,
          clientY,
          tool
        );

        if (element) {
          setElements(prev => prev.concat(element));
          setSelectedElement({
            ...element,
            position: null,
          });
        }

        setAction('drawing');
      }
    },
    canvasRef
  );

  useEventListener(
    'mousemove',
    event => {
      const { clientX, clientY } = event;

      if (tool === 'selection') {
        const canvas = event.target as HTMLCanvasElement;
        const element = getElementAtPosition(clientX, clientY, elements);
        canvas.style.cursor = element?.position
          ? cursorForPosition(element.position)
          : 'default';
      }

      if (action === 'drawing' && tool !== 'selection') {
        const index = elements.length - 1;
        const element = elements[index];
        const { type } = element;

        switch (type) {
          case Tool.LINE:
          case Tool.RECTANGLE: {
            const { x1, y1 } = element;
            updateElement(index, x1, y1, clientX, clientY, tool);
            break;
          }
          case Tool.PENCIL: {
            updateElement(index, clientX, clientY, clientX, clientY, tool);
          }
        }
      }

      if (selectedElement) {
        if (action === 'moving') {
          switch (selectedElement.type) {
            case Tool.PENCIL: {
              const newPoints = selectedElement.points.map((_, index) => ({
                x: clientX - selectedElement.xOffsets?.[index]!,
                y: clientY - selectedElement.yOffsets?.[index]!,
              }));

              const elementsCopy = elements.map(element => {
                if (
                  element.id === selectedElement.id &&
                  element.type === Tool.PENCIL
                ) {
                  return { ...element, points: newPoints };
                }
                return element;
              });

              setElements(elementsCopy, true);
              break;
            }

            case Tool.LINE:
            case Tool.RECTANGLE:
              const { id, x1, y1, x2, y2, type, offsetX, offsetY } =
                selectedElement;

              const width = x2 - x1;
              const height = y2 - y1;

              const newX1 = clientX - offsetX!;
              const newY1 = clientY - offsetY!;

              updateElement(
                id,
                newX1,
                newY1,
                newX1 + width,
                newY1 + height,
                type
              );
              break;
          }
        }

        if (action === 'resizing') {
          switch (selectedElement.type) {
            case Tool.RECTANGLE:
            case Tool.LINE:
              const { id, type, position, ...coordinates } = selectedElement;

              if (position) {
                const { x1, y1, x2, y2 } = resizedCoordinates(
                  clientX,
                  clientY,
                  position as Exclude<SelectedElement['position'], 'inside'>,
                  coordinates
                );

                updateElement(id, x1, y1, x2, y2, type);
              }
              break;

            default:
              break;
          }
        }
      }
    },
    canvasRef
  );

  useEventListener(
    'mouseup',
    () => {
      const index = selectedElement?.id;
      if (index && ['drawing', 'resizing'].includes(action)) {
        const { id, type } = elements[index];
        if (adjustmentRequired(type)) {
          const { x1, y1, x2, y2 } = adjustElementCoords(elements[index]);
          updateElement(id, x1, y1, x2, y2, type);
        }
      }

      setAction('none');
      setSelectedElement(null);
    },
    canvasRef
  );

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    clientX: number,
    clientY: number,
    type: Exclude<Tool, Tool.SELECTION>
  ) => {
    const elementsCopy = elements.map(element => {
      if (element.id === id && element.type === type) {
        switch (element.type) {
          case Tool.LINE:
          case Tool.RECTANGLE: {
            return generateElement(id, x1, y1, clientX, clientY, type)!;
          }

          case Tool.PENCIL: {
            return {
              ...element,
              points: [...element.points, { x: clientX, y: clientY }],
            };
          }
        }
      }

      return element;
    });

    setElements(elementsCopy, true);
  };

  return (
    <div>
      <div style={{ position: 'fixed' }}>
        <input
          type="radio"
          id="selection"
          onChange={() => setTool(Tool.SELECTION)}
          checked={tool === Tool.SELECTION}
        />
        <label htmlFor="selection">Selection</label>

        <input
          type="radio"
          id="line"
          onChange={() => setTool(Tool.LINE)}
          checked={tool === Tool.LINE}
        />
        <label htmlFor="line">Line</label>

        <input
          type="radio"
          id="rectangle"
          onChange={() => setTool(Tool.RECTANGLE)}
          checked={tool === Tool.RECTANGLE}
        />
        <label htmlFor="rectangle">Rectangle</label>

        <input
          type="radio"
          id="pencil"
          onChange={() => setTool(Tool.PENCIL)}
          checked={tool === Tool.PENCIL}
        />
        <label htmlFor="pencil">Pencil</label>
        <input type="radio" id="text" />
        <label htmlFor="text">Text</label>
      </div>
      <div style={{ position: 'fixed', bottom: 0, padding: 10 }}>
        <button onClick={() => undo()}>Undo</button>
        <button onClick={() => redo()}>Redo</button>
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
