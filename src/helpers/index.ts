import getStroke from 'perfect-freehand';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { DrawnElement, SelectedElement, Tool } from '../types';

const generator = rough.generator();

interface Point {
  x: number;
  y: number;
}

const distance = (a: Point, b: { x: number; y: number }) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export const generateElement = (
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: Tool
): DrawnElement | undefined => {
  switch (type) {
    case Tool.LINE: {
      const roughElement = generator.line(x1, y1, x2, y2);
      return { id, x1, y1, x2, y2, type, roughElement };
    }

    case Tool.RECTANGLE: {
      const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      return { id, x1, y1, x2, y2, type, roughElement };
    }

    case Tool.PENCIL:
      return { id, type, points: [{ x: x1, y: y1 }] };

    default:
      break;
  }
};

function nearPoint(
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: Exclude<SelectedElement['position'], 'inside'>
) {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
}

const onLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
  maxDistance = 1
) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? 'inside' : null;
};

const positionWithinElement = (
  x: number,
  y: number,
  element: DrawnElement
): SelectedElement['position'] => {
  switch (element.type) {
    case Tool.RECTANGLE: {
      const { x1, x2, y1, y2 } = element;
      const topLeft = nearPoint(x, y, x1, y1, 'tl');
      const topRight = nearPoint(x, y, x2, y1, 'tr');
      const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
      const bottomRight = nearPoint(x, y, x2, y2, 'br');
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }
    case Tool.LINE: {
      const { x1, x2, y1, y2 } = element;
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, 'start');
      const end = nearPoint(x, y, x2, y2, 'end');
      return start || end || on;
    }

    case Tool.PENCIL: {
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return (
          onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
        );
      });
      return betweenAnyPoint ? 'inside' : null;
    }
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawnElement[]
) => {
  const result = elements
    .map(element => {
      const position = positionWithinElement(x, y, element);
      return {
        ...element,
        position,
      };
    })
    .find(element => element.position !== null)!;
  return result;
};

export const adjustElementCoords = (
  element: DrawnElement
): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} => {
  switch (element.type) {
    case Tool.RECTANGLE:
      const { x1, y1, x2, y2 } = element;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    case Tool.LINE: {
      const { x1, y1, x2, y2 } = element;
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      }

      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }

    default:
      return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }
};

export const cursorForPosition = (position: SelectedElement['position']) => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';

    case 'tr':
    case 'bl':
      return 'nesw-resize';

    default:
      return 'move';
  }
};

export const resizedCoordinates = (
  clientX: number,
  clientY: number,
  position: Exclude<SelectedElement['position'], 'inside'>,
  coordinates: { x1: number; y1: number; x2: number; y2: number }
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position as NonNullable<typeof position>) {
    case 'tl':
    case 'start':
      return { x1: clientX, y1: clientY, x2, y2 };
    case 'tr':
      return { x1, y1: clientY, x2: clientX, y2 };
    case 'bl':
      return { x1: clientX, y1, x2, y2: clientY };
    case 'br':
    case 'end':
      return { x1, y1, x2: clientX, y2: clientY };
  }
};

const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
};

export const drawElement = (
  roughCanvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  element: DrawnElement
) => {
  switch (element.type) {
    case Tool.LINE:
    case Tool.RECTANGLE:
      roughCanvas.draw(element.roughElement);
      break;
    case Tool.PENCIL:
      const stroke = getSvgPathFromStroke(getStroke(element.points));
      context.fill(new Path2D(stroke));
      break;
  }
};

export const adjustmentRequired = (type: Tool) =>
  [Tool.LINE, Tool.RECTANGLE].includes(type);
