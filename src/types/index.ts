import type { Drawable } from 'roughjs/bin/core';

export interface DrawnElement {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: Drawable;
}

export type ElementType = 'line' | 'rectangle';

export type { Drawable };
