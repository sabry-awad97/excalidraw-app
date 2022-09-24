import rough from 'roughjs';
import { ElementType } from '../types';

const generator = rough.generator();

export const generateElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ElementType
) => {
  switch (type) {
    case 'line': {
      const roughElement = generator.line(x1, y1, x2, y2);
      return { x1, y1, x2, y2, roughElement };
    }
    case 'rectangle': {
      const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      return { x1, y1, x2, y2, roughElement };
    }
  }
};
