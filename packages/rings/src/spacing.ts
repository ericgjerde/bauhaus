/**
 * Ring spacing calculation algorithms
 */

import { PHI, lerp } from '@bauhaus/core';
import type { SpacingMode } from './types.js';

/**
 * Calculate radii for all rings based on spacing mode
 * Returns radii from outermost to innermost
 */
export function calculateRadii(
  outerRadius: number,
  ringCount: number,
  mode: SpacingMode,
  options: {
    innerRadius?: number;
    outerGap?: number;
    shrinkage?: number;
  } = {}
): number[] {
  if (ringCount <= 0) return [];
  if (ringCount === 1) return [outerRadius];

  const radii: number[] = [];

  switch (mode) {
    case 'shrinkage':
      return calculateShrinkageRadii(
        outerRadius,
        ringCount,
        options.outerGap || 18,
        options.shrinkage || 0.05
      );

    case 'uniform': {
      const innerRadius = options.innerRadius || outerRadius * 0.1;
      const range = outerRadius - innerRadius;
      // From outer to inner
      for (let i = 0; i < ringCount; i++) {
        const t = i / (ringCount - 1);
        radii.push(outerRadius - range * t);
      }
      break;
    }

    case 'graduated': {
      const innerRadius = options.innerRadius || outerRadius * 0.1;
      const range = outerRadius - innerRadius;
      // From outer to inner with quadratic easing (gaps get smaller toward center)
      for (let i = 0; i < ringCount; i++) {
        const t = i / (ringCount - 1);
        const easedT = t * t;
        radii.push(outerRadius - range * easedT);
      }
      break;
    }

    case 'goldenRatio': {
      const innerRadius = options.innerRadius || outerRadius * 0.1;
      const range = outerRadius - innerRadius;
      const totalParts = goldenRatioSum(ringCount - 1);
      const unitSize = range / totalParts;
      let currentRadius = outerRadius;
      radii.push(currentRadius);

      for (let i = 1; i < ringCount; i++) {
        // Gaps shrink as we go inward (reverse of original)
        const gap = unitSize * Math.pow(PHI, ringCount - 1 - i);
        currentRadius -= gap;
        radii.push(currentRadius);
      }
      break;
    }
  }

  return radii;
}

/**
 * Calculate radii using percentage-based shrinkage from outer to inner
 *
 * @param outerRadius - Radius of outermost ring
 * @param ringCount - Number of rings
 * @param outerGap - Gap between outermost rings (base size)
 * @param shrinkage - Shrinkage factor per ring (0-1), e.g., 0.1 = 10% smaller each ring
 * @returns Array of radii from outermost to innermost
 */
export function calculateShrinkageRadii(
  outerRadius: number,
  ringCount: number,
  outerGap: number,
  shrinkage: number
): number[] {
  if (ringCount <= 0) return [];
  if (ringCount === 1) return [outerRadius];

  const radii: number[] = [outerRadius];
  let currentRadius = outerRadius;
  let currentGap = outerGap;
  const multiplier = 1 - shrinkage;

  for (let i = 1; i < ringCount; i++) {
    currentRadius -= currentGap;

    // Don't go below 0
    if (currentRadius <= 0) {
      break;
    }

    radii.push(currentRadius);
    currentGap *= multiplier;
  }

  return radii;
}

/**
 * Sum of golden ratio series: 1 + PHI + PHI^2 + ... + PHI^(n-1)
 */
function goldenRatioSum(n: number): number {
  if (n <= 0) return 0;
  return (Math.pow(PHI, n) - 1) / (PHI - 1);
}

/**
 * Calculate graduated spacing where spacing decreases from 100% to 10%
 * @deprecated Use calculateRadii with 'shrinkage' mode instead
 */
export function calculatePercentageRadii(
  innerRadius: number,
  outerRadius: number,
  ringCount: number,
  startPercent: number = 100,
  endPercent: number = 10
): number[] {
  if (ringCount <= 0) return [];
  if (ringCount === 1) return [outerRadius];

  const radii: number[] = [];
  const range = outerRadius - innerRadius;

  let sumPercent = 0;
  for (let i = 0; i < ringCount - 1; i++) {
    const t = ringCount > 2 ? i / (ringCount - 2) : 0;
    sumPercent += lerp(startPercent, endPercent, t);
  }

  const unit = range / sumPercent;
  let currentRadius = outerRadius;
  radii.push(currentRadius);

  for (let i = 0; i < ringCount - 1; i++) {
    const t = ringCount > 2 ? i / (ringCount - 2) : 0;
    const spacing = unit * lerp(startPercent, endPercent, t);
    currentRadius -= spacing;
    radii.push(currentRadius);
  }

  return radii;
}
