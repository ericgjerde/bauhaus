/**
 * Square spacing calculation algorithms
 */

import { lerp } from '@bauhaus/core';
import type { SquareSpacingMode } from './types.js';

/**
 * Calculate sizes for all squares based on spacing mode
 * Returns sizes from outermost to innermost
 */
export function calculateSquareSizes(
  outerSize: number,
  squareCount: number,
  mode: SquareSpacingMode,
  options: {
    innerSize?: number;
    outerGap?: number;
    shrinkage?: number;
  } = {}
): number[] {
  if (squareCount <= 0) return [];
  if (squareCount === 1) return [outerSize];

  const sizes: number[] = [];

  switch (mode) {
    case 'shrinkage':
      return calculateShrinkageSizes(
        outerSize,
        squareCount,
        options.outerGap || 24,
        options.shrinkage || 0.05
      );

    case 'uniform': {
      const innerSize = options.innerSize || outerSize * 0.1;
      const range = outerSize - innerSize;
      // From outer to inner
      for (let i = 0; i < squareCount; i++) {
        const t = i / (squareCount - 1);
        sizes.push(outerSize - range * t);
      }
      break;
    }

    case 'graduated': {
      const innerSize = options.innerSize || outerSize * 0.1;
      const range = outerSize - innerSize;
      // From outer to inner with quadratic easing
      for (let i = 0; i < squareCount; i++) {
        const t = i / (squareCount - 1);
        const easedT = t * t;
        sizes.push(outerSize - range * easedT);
      }
      break;
    }
  }

  return sizes;
}

/**
 * Calculate sizes using percentage-based shrinkage from outer to inner
 */
export function calculateShrinkageSizes(
  outerSize: number,
  squareCount: number,
  outerGap: number,
  shrinkage: number
): number[] {
  if (squareCount <= 0) return [];
  if (squareCount === 1) return [outerSize];

  const sizes: number[] = [outerSize];
  let currentSize = outerSize;
  let currentGap = outerGap;
  const multiplier = 1 - shrinkage;

  for (let i = 1; i < squareCount; i++) {
    currentSize -= currentGap;

    if (currentSize <= 0) {
      break;
    }

    sizes.push(currentSize);
    currentGap *= multiplier;
  }

  return sizes;
}
