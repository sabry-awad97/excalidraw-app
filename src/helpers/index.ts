import rough from 'roughjs';
import { DrawnElement, ElementType } from '../types';

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

const positionWithinElement = (x: number, y: number, element: DrawnElement) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case 'rectangle':
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    case 'line':
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };
      const offset = distance(a, b) - (distance(a, c) + distance(b, c));
      return Math.abs(offset) < 1;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawnElement[]
) => {
  return elements.find(element => positionWithinElement(x, y, element));
};
