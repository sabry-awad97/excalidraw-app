import type { Drawable } from 'roughjs/bin/core';

export interface DrawnElement {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: Exclude<ElementType, 'selection'>;
  roughElement: Drawable;
}

export type ElementType = 'line' | 'rectangle' | 'selection';

export type { Drawable };
