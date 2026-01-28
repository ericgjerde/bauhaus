/**
 * Core geometry types for Bauhaus pattern generation
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Arc {
  center: Point2D;
  radius: number;
  startAngle: number; // in radians
  endAngle: number;   // in radians
  clockwise?: boolean;
}

export interface Circle {
  center: Point2D;
  radius: number;
}

export interface Line {
  start: Point2D;
  end: Point2D;
}

export interface PathSegment {
  type: 'M' | 'L' | 'A' | 'Z';
  data: number[];
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
