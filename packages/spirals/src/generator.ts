/**
 * Multi-arm spiral pattern generator
 * Creates interleaving spiral arms using bezier curves
 */

import {
  degToRad,
  pointOnCircle,
  circleToPath,
  type Point2D,
} from '@bauhaus/core';

import type {
  SpiralPatternConfig,
  GeneratedSpiralArm,
  GeneratedSpiralPattern,
  SpiralType,
} from './types.js';
import { DEFAULT_SPIRAL_CONFIG } from './types.js';

/**
 * Generate a complete multi-arm spiral pattern from configuration
 */
export function generateSpiralPattern(
  config: Partial<SpiralPatternConfig> = {}
): GeneratedSpiralPattern {
  const cfg = { ...DEFAULT_SPIRAL_CONFIG, ...config };

  // Default center to middle of pattern
  const center = cfg.center || {
    x: cfg.outerRadius,
    y: cfg.outerRadius,
  };

  // Generate each spiral arm
  const arms: GeneratedSpiralArm[] = [];
  const armAngleStep = (2 * Math.PI) / cfg.armCount;

  for (let i = 0; i < cfg.armCount; i++) {
    const startAngle = degToRad(cfg.rotation) + i * armAngleStep;

    const pathData = generateSpiralArm(
      center,
      cfg.innerRadius,
      cfg.outerRadius,
      startAngle,
      cfg.turns,
      cfg.spiralType,
      cfg.growthFactor
    );

    arms.push({
      index: i,
      startAngle,
      pathData,
    });
  }

  // Generate outer boundary if enabled
  let outerBoundary: string | undefined;
  if (cfg.showOuterBoundary) {
    outerBoundary = circleToPath(center, cfg.outerRadius);
  }

  return {
    arms,
    outerBoundary,
    center,
  };
}

/**
 * Generate a single spiral arm path using bezier curves
 */
export function generateSpiralArm(
  center: Point2D,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  turns: number,
  spiralType: SpiralType,
  growthFactor: number
): string {
  // Number of segments for smooth curve approximation
  const segmentsPerTurn = 32;
  const totalSegments = Math.ceil(turns * segmentsPerTurn);

  // Generate points along the spiral
  const points: Point2D[] = [];

  for (let i = 0; i <= totalSegments; i++) {
    const t = i / totalSegments;
    const angle = startAngle + t * turns * 2 * Math.PI;
    const radius = calculateSpiralRadius(
      innerRadius,
      outerRadius,
      t,
      spiralType,
      growthFactor
    );

    points.push(pointOnCircle(center, radius, angle));
  }

  // Convert points to a smooth bezier path
  return pointsToBezierPath(points);
}

/**
 * Calculate radius at a given point along the spiral
 */
function calculateSpiralRadius(
  innerRadius: number,
  outerRadius: number,
  t: number, // 0 to 1 progress along spiral
  spiralType: SpiralType,
  growthFactor: number
): number {
  const range = outerRadius - innerRadius;

  switch (spiralType) {
    case 'logarithmic': {
      // r = a * e^(b*theta)
      // Exponential growth - starts slow, accelerates
      const expT = (Math.exp(growthFactor * t * 10) - 1) / (Math.exp(growthFactor * 10) - 1);
      return innerRadius + range * expT;
    }

    case 'archimedean': {
      // r = a + b*theta
      // Linear growth - constant spacing
      return innerRadius + range * t;
    }

    case 'fermat': {
      // r = a * sqrt(theta)
      // Slowing growth - starts fast, slows down
      return innerRadius + range * Math.sqrt(t);
    }

    default:
      return innerRadius + range * t;
  }
}

/**
 * Convert a series of points to a smooth bezier path
 * Uses Catmull-Rom spline converted to cubic bezier
 */
function pointsToBezierPath(points: Point2D[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)} L ${points[1].x.toFixed(3)} ${points[1].y.toFixed(3)}`;
  }

  const pathParts: string[] = [];

  // Move to first point
  pathParts.push(`M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`);

  // Generate smooth cubic bezier curves through all points
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const tension = 0.5;

    const cp1: Point2D = {
      x: p1.x + (p2.x - p0.x) * tension / 3,
      y: p1.y + (p2.y - p0.y) * tension / 3,
    };

    const cp2: Point2D = {
      x: p2.x - (p3.x - p1.x) * tension / 3,
      y: p2.y - (p3.y - p1.y) * tension / 3,
    };

    pathParts.push(
      `C ${cp1.x.toFixed(3)} ${cp1.y.toFixed(3)}, ${cp2.x.toFixed(3)} ${cp2.y.toFixed(3)}, ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`
    );
  }

  return pathParts.join(' ');
}

/**
 * Generate a simple Archimedean spiral (evenly spaced)
 */
export function generateArchimedeanSpiral(
  center: Point2D,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  turns: number
): string {
  return generateSpiralArm(center, innerRadius, outerRadius, startAngle, turns, 'archimedean', 0);
}

/**
 * Generate a logarithmic spiral (golden spiral style)
 */
export function generateLogarithmicSpiral(
  center: Point2D,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  turns: number,
  growthFactor: number = 0.2
): string {
  return generateSpiralArm(center, innerRadius, outerRadius, startAngle, turns, 'logarithmic', growthFactor);
}
