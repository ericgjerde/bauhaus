/**
 * Concentric square pattern generator
 * Creates nested square patterns with optional alternating directions
 */

import {
  degToRad,
  PathBuilder,
  type Point2D,
} from '@bauhaus/core';

import type {
  SquarePatternConfig,
  GeneratedSquare,
  GeneratedSquarePattern,
} from './types.js';
import { DEFAULT_SQUARE_CONFIG } from './types.js';
import { calculateSquareSizes } from './spacing.js';

/**
 * Generate a complete concentric square pattern from configuration
 */
export function generateSquarePattern(
  config: Partial<SquarePatternConfig> = {}
): GeneratedSquarePattern {
  const cfg = { ...DEFAULT_SQUARE_CONFIG, ...config };

  // Default center to middle of pattern
  const center = cfg.center || {
    x: cfg.outerSize,
    y: cfg.outerSize,
  };

  // Calculate all square sizes (from outer to inner)
  const sizes = calculateSquareSizes(cfg.outerSize, cfg.squareCount, cfg.spacingMode, {
    innerSize: cfg.innerSize,
    outerGap: cfg.outerGap,
    shrinkage: cfg.shrinkage,
  });

  // Generate each square
  const squares: GeneratedSquare[] = sizes.map((size, index) => {
    // Alternate direction if enabled
    const clockwise = cfg.alternating ? index % 2 === 0 : true;

    const pathData = cfg.notchesPerSide > 0
      ? generateSquareWithNotches(center, size, cfg.rotation, clockwise, cfg.notchesPerSide, cfg.notchWidth)
      : generateSquare(center, size, cfg.rotation, clockwise);

    return {
      index,
      size,
      clockwise,
      pathData,
    };
  });

  // Generate outer boundary if enabled
  let outerBoundary: string | undefined;
  if (cfg.showOuterBoundary) {
    outerBoundary = generateSquare(center, cfg.outerSize, cfg.rotation, true);
  }

  return {
    squares,
    outerBoundary,
    center,
    sizes,
  };
}

/**
 * Generate corner points of a square
 */
function getSquareCorners(
  center: Point2D,
  size: number,
  rotationDeg: number
): Point2D[] {
  const angle = degToRad(rotationDeg);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Corner offsets before rotation
  const offsets = [
    { x: -size, y: -size }, // top-left
    { x: size, y: -size },  // top-right
    { x: size, y: size },   // bottom-right
    { x: -size, y: size },  // bottom-left
  ];

  return offsets.map(offset => ({
    x: center.x + offset.x * cos - offset.y * sin,
    y: center.y + offset.x * sin + offset.y * cos,
  }));
}

/**
 * Generate a simple square path
 */
export function generateSquare(
  center: Point2D,
  size: number,
  rotationDeg: number = 0,
  clockwise: boolean = true
): string {
  const corners = getSquareCorners(center, size, rotationDeg);

  const builder = new PathBuilder();

  if (clockwise) {
    builder.moveTo(corners[0])
      .lineTo(corners[1])
      .lineTo(corners[2])
      .lineTo(corners[3])
      .closePath();
  } else {
    builder.moveTo(corners[0])
      .lineTo(corners[3])
      .lineTo(corners[2])
      .lineTo(corners[1])
      .closePath();
  }

  return builder.build();
}

/**
 * Generate a square with notches for expandable mesh pattern
 * Uses polyline (open path) instead of closed square
 */
export function generateSquareWithNotches(
  center: Point2D,
  size: number,
  rotationDeg: number = 0,
  clockwise: boolean = true,
  notchesPerSide: number = 2,
  notchWidth: number = 8
): string {
  const corners = getSquareCorners(center, size, rotationDeg);

  // For the alternating pattern, we draw polylines with gaps
  // The direction determines which corners we skip
  const builder = new PathBuilder();

  // Side length
  const sideLength = size * 2;

  // Calculate notch positions along each side
  const segmentLength = sideLength / (notchesPerSide + 1);
  const notchHalf = notchWidth / 2;

  // Generate path with notches
  // We draw as a polyline (not closed) to create the alternating pattern

  if (clockwise) {
    // Start from middle of first side (top)
    const startPoint = interpolate(corners[0], corners[1], 0.5);
    builder.moveTo(startPoint);

    // Draw to top-right corner
    builder.lineTo(corners[1]);

    // Right side with notches
    drawSideWithNotches(builder, corners[1], corners[2], notchesPerSide, notchHalf, segmentLength);

    // Bottom-right corner
    builder.lineTo(corners[2]);

    // Bottom side with notches
    drawSideWithNotches(builder, corners[2], corners[3], notchesPerSide, notchHalf, segmentLength);

    // Bottom-left corner
    builder.lineTo(corners[3]);

    // Left side with notches
    drawSideWithNotches(builder, corners[3], corners[0], notchesPerSide, notchHalf, segmentLength);

    // Top-left corner
    builder.lineTo(corners[0]);

    // Back to start (top side partial)
    const endPoint = interpolate(corners[0], corners[1], 0.5);
    drawSideWithNotches(builder, corners[0], endPoint, Math.floor(notchesPerSide / 2), notchHalf, segmentLength);
  } else {
    // Counter-clockwise - start from middle of first side
    const startPoint = interpolate(corners[0], corners[3], 0.5);
    builder.moveTo(startPoint);

    // Draw to bottom-left corner
    builder.lineTo(corners[3]);

    // Bottom side (reversed)
    drawSideWithNotches(builder, corners[3], corners[2], notchesPerSide, notchHalf, segmentLength);

    builder.lineTo(corners[2]);

    // Right side (reversed)
    drawSideWithNotches(builder, corners[2], corners[1], notchesPerSide, notchHalf, segmentLength);

    builder.lineTo(corners[1]);

    // Top side (reversed)
    drawSideWithNotches(builder, corners[1], corners[0], notchesPerSide, notchHalf, segmentLength);

    builder.lineTo(corners[0]);

    // Back to start
    const endPoint = interpolate(corners[0], corners[3], 0.5);
    drawSideWithNotches(builder, corners[0], endPoint, Math.floor(notchesPerSide / 2), notchHalf, segmentLength);
  }

  return builder.build();
}

/**
 * Draw a side with notch gaps
 */
function drawSideWithNotches(
  builder: PathBuilder,
  start: Point2D,
  end: Point2D,
  notchCount: number,
  notchHalf: number,
  _segmentLength: number
): void {
  if (notchCount <= 0) {
    return;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  // Notch positions are evenly distributed
  for (let i = 1; i <= notchCount; i++) {
    const t = i / (notchCount + 1);
    const notchCenter = interpolate(start, end, t);

    // Draw to just before notch
    const beforeNotch = {
      x: notchCenter.x - ux * notchHalf,
      y: notchCenter.y - uy * notchHalf,
    };
    builder.lineTo(beforeNotch);

    // Jump over notch (move without drawing)
    const afterNotch = {
      x: notchCenter.x + ux * notchHalf,
      y: notchCenter.y + uy * notchHalf,
    };
    builder.moveTo(afterNotch);
  }
}

/**
 * Linear interpolation between two points
 */
function interpolate(p1: Point2D, p2: Point2D, t: number): Point2D {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}
