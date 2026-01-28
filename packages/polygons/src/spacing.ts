/**
 * Polygon spacing calculation algorithms
 */

import type { PolygonSpacingMode } from './types.js';

/**
 * Calculate radii for all polygons based on spacing mode
 * Returns radii from outermost to innermost
 */
export function calculatePolygonRadii(
  outerRadius: number,
  polygonCount: number,
  mode: PolygonSpacingMode,
  options: {
    innerRadius?: number;
    outerGap?: number;
    shrinkage?: number;
  } = {}
): number[] {
  if (polygonCount <= 0) return [];
  if (polygonCount === 1) return [outerRadius];

  const radii: number[] = [];

  switch (mode) {
    case 'shrinkage':
      return calculateShrinkageRadii(
        outerRadius,
        polygonCount,
        options.outerGap || 24,
        options.shrinkage || 0.05
      );

    case 'uniform': {
      const innerRadius = options.innerRadius || outerRadius * 0.1;
      const range = outerRadius - innerRadius;
      // From outer to inner
      for (let i = 0; i < polygonCount; i++) {
        const t = i / (polygonCount - 1);
        radii.push(outerRadius - range * t);
      }
      break;
    }

    case 'graduated': {
      const innerRadius = options.innerRadius || outerRadius * 0.1;
      const range = outerRadius - innerRadius;
      // From outer to inner with quadratic easing
      for (let i = 0; i < polygonCount; i++) {
        const t = i / (polygonCount - 1);
        const easedT = t * t;
        radii.push(outerRadius - range * easedT);
      }
      break;
    }
  }

  return radii;
}

/**
 * Calculate radii using percentage-based shrinkage from outer to inner
 */
export function calculateShrinkageRadii(
  outerRadius: number,
  polygonCount: number,
  outerGap: number,
  shrinkage: number
): number[] {
  if (polygonCount <= 0) return [];
  if (polygonCount === 1) return [outerRadius];

  const radii: number[] = [outerRadius];
  let currentRadius = outerRadius;
  let currentGap = outerGap;
  const multiplier = 1 - shrinkage;

  for (let i = 1; i < polygonCount; i++) {
    currentRadius -= currentGap;

    if (currentRadius <= 0) {
      break;
    }

    radii.push(currentRadius);
    currentGap *= multiplier;
  }

  return radii;
}
