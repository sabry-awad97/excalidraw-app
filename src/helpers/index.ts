import rough from 'roughjs';
import { DrawnElement, ElementPosition, ElementType } from '../types';

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
  type: Exclude<ElementType, 'selection'>
) => {
  switch (type) {
    case 'line': {
      const roughElement = generator.line(x1, y1, x2, y2);
      return { id, x1, y1, x2, y2, type, roughElement };
    }
    case 'rectangle': {
      const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      return { id, x1, y1, x2, y2, type, roughElement };
    }
  }
};

function nearPoint(
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: Exclude<ElementPosition, 'inside'>
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
): ElementPosition | null => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case 'rectangle':
      const topLeft = nearPoint(x, y, x1, y1, 'tl');
      const topRight = nearPoint(x, y, x2, y1, 'tr');
      const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
      const bottomRight = nearPoint(x, y, x2, y2, 'br');
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case 'line':
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, 'start');
      const end = nearPoint(x, y, x2, y2, 'end');
      return start || end || on;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawnElement[]
) => {
  return elements
    .map(element => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find(element => element.position !== null);
};

export const adjustElementCoords = (
  element: DrawnElement
): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} => {
  const { x1, y1, x2, y2, type } = element;
  switch (type) {
    case 'rectangle':
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    case 'line':
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      }

      return { x1: x2, y1: y2, x2: x1, y2: y1 };
  }
};

export const cursorForPosition = (position: ElementPosition) => {
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
  position: Exclude<ElementPosition, 'inside'>,
  coordinates: { x1: number; y1: number; x2: number; y2: number }
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
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
