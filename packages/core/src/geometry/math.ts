/**
 * Vector math and geometry utilities
 */

import type { Point2D, BoundingBox } from './types.js';

/** Convert degrees to radians */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Convert radians to degrees */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Calculate distance between two points */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Calculate point on circle at given angle */
export function pointOnCircle(
  center: Point2D,
  radius: number,
  angle: number // radians
): Point2D {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

/** Normalize angle to [0, 2*PI) range */
export function normalizeAngle(angle: number): number {
  const twoPi = 2 * Math.PI;
  let result = angle % twoPi;
  if (result < 0) result += twoPi;
  return result;
}

/** Calculate arc sweep angle (always positive) */
export function arcSweep(startAngle: number, endAngle: number, clockwise: boolean = false): number {
  let sweep = endAngle - startAngle;
  if (clockwise) {
    if (sweep > 0) sweep -= 2 * Math.PI;
  } else {
    if (sweep < 0) sweep += 2 * Math.PI;
  }
  return Math.abs(sweep);
}

/** Linear interpolation between two values */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Golden ratio constant */
export const PHI = (1 + Math.sqrt(5)) / 2;

/** Calculate bounding box for a set of points */
export function boundingBox(points: Point2D[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/** Round number to specified decimal places */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
