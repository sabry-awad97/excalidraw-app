import type { Drawable } from 'roughjs/bin/core';

export type { Drawable };

export enum Tool {
  LINE = 'line',
  RECTANGLE = 'rectangle',
  PENCIL = 'pencil',
  SELECTION = 'selection',
}

interface Identifiable {
  id: number;
}

interface WithRoughElement {
  roughElement: Drawable;
}

interface WwithCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Line extends Identifiable, WithRoughElement, WwithCoordinates {
  type: Tool.LINE;
}

export interface Rectangle
  extends Identifiable,
    WithRoughElement,
    WwithCoordinates {
  type: Tool.RECTANGLE;
}

export interface Pencil extends Identifiable {
  type: Tool.PENCIL;
  points: { x: number; y: number }[];
}

export type DrawnElement = Line | Rectangle | Pencil;

interface SelectedLineElement extends Line {
  offsetX?: number;
  offsetY?: number;
}

interface SelectedRectangleElement extends Rectangle {
  offsetX?: number;
  offsetY?: number;
}

interface SelectedPencilElement extends Pencil {
  xOffsets?: number[];
  yOffsets?: number[];
}

export type SelectedElement =
  | (SelectedLineElement | SelectedRectangleElement | SelectedPencilElement) & {
      position: 'tl' | 'tr' | 'br' | 'bl' | 'start' | 'end' | 'inside' | null;
    };
