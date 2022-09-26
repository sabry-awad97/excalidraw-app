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

export interface SelectedElement extends DrawnElement {
  position: ElementPosition | null;
  offsetX: number;
  offsetY: number;
}

export type ElementType = 'line' | 'rectangle' | 'selection';

export type ElementPosition =
  | 'tl'
  | 'br'
  | 'start'
  | 'end'
  | 'tr'
  | 'bl'
  | 'inside';

export type { Drawable };
