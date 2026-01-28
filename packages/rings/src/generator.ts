/**
 * Ring pattern generator
 * Creates concentric ring patterns with staggered cuts for expandable mesh
 */

import {
  degToRad,
  pointOnCircle,
  circleToPath,
  PathBuilder,
  type Point2D,
} from '@bauhaus/core';

import type {
  RingPatternConfig,
  GeneratedRing,
  GeneratedPattern,
} from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { calculateRadii } from './spacing.js';

/**
 * Generate a complete ring pattern from configuration
 */
export function generateRingPattern(
  config: Partial<RingPatternConfig> = {}
): GeneratedPattern {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Default center to middle of pattern
  const center = cfg.center || {
    x: cfg.outerRadius,
    y: cfg.outerRadius,
  };

  // Calculate all ring radii (from outer to inner)
  const radii = calculateRadii(cfg.outerRadius, cfg.ringCount, cfg.spacingMode, {
    innerRadius: cfg.innerRadius,
    outerGap: cfg.outerGap,
    shrinkage: cfg.shrinkage,
  });

  // Generate each ring
  const rings: GeneratedRing[] = radii.map((radius, index) => {
    // Calculate rotation for this ring based on grid and stagger
    const rotation = calculateStaggeredRotation(
      index,
      cfg.gridDivisions,
      cfg.staggerOffset
    );

    // Outermost ring (index 0) is always a solid circle for cutting
    // Inner rings get cuts for the expandable mesh pattern
    const pathData =
      index === 0 || cfg.cutCount <= 0
        ? circleToPath(center, radius)
        : generateRingWithCuts(center, radius, cfg.cutCount, cfg.cutWidth, rotation);

    return {
      index,
      radius,
      rotation,
      pathData,
    };
  });

  // Generate outer boundary if enabled
  let outerBoundary: string | undefined;
  if (cfg.showOuterBoundary) {
    outerBoundary = circleToPath(center, cfg.outerRadius);
  }

  return {
    rings,
    outerBoundary,
    center,
    radii,
  };
}

/**
 * Calculate rotation angle for a ring based on grid alignment and stagger
 *
 * @param ringIndex - Index of the ring (0 = outermost)
 * @param gridDivisions - Number of grid divisions (e.g., 16 for 16ths)
 * @param staggerOffset - Grid positions to offset for alternating rings
 * @returns Rotation in radians
 */
export function calculateStaggeredRotation(
  ringIndex: number,
  gridDivisions: number,
  staggerOffset: number
): number {
  // Angle per grid division
  const gridAngle = (2 * Math.PI) / gridDivisions;

  // Odd rings at position 0, even rings offset by staggerOffset
  const gridPosition = ringIndex % 2 === 0 ? 0 : staggerOffset;

  return gridPosition * gridAngle;
}

/**
 * Generate a ring with evenly-spaced cuts
 * Creates N arcs separated by cuts of cutWidth
 *
 * @param center - Center point
 * @param radius - Ring radius
 * @param cutCount - Number of cuts
 * @param cutWidth - Width of each cut in pixels (arc length)
 * @param rotation - Starting rotation in radians
 */
export function generateRingWithCuts(
  center: Point2D,
  radius: number,
  cutCount: number,
  cutWidth: number,
  rotation: number = 0
): string {
  if (cutCount <= 0) {
    return circleToPath(center, radius);
  }

  // Calculate cut gap angle (in radians)
  // Cut width is an arc length, convert to angle
  const cutAngle = cutWidth / radius;

  // Each segment spans (2*PI / cutCount) radians
  const segmentAngle = (2 * Math.PI) / cutCount;

  // Arc angle is segment minus cut gap
  const arcAngle = segmentAngle - cutAngle;

  // If arc angle is too small or negative, just draw a circle
  if (arcAngle <= 0) {
    return circleToPath(center, radius);
  }

  const paths: string[] = [];

  for (let i = 0; i < cutCount; i++) {
    // Start angle for this arc (with rotation offset)
    // Center the cut on the grid position
    const startAngle = rotation + i * segmentAngle + cutAngle / 2;
    const endAngle = startAngle + arcAngle;

    const arcPath = generateArc(center, radius, startAngle, endAngle);
    paths.push(arcPath);
  }

  return paths.join(' ');
}

/**
 * Generate a single arc SVG path
 */
function generateArc(
  center: Point2D,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = pointOnCircle(center, radius, startAngle);
  const end = pointOnCircle(center, radius, endAngle);

  // Determine if arc is large (> 180 degrees)
  const sweepAngle = endAngle - startAngle;
  const largeArc = sweepAngle > Math.PI;

  const builder = new PathBuilder();
  builder.moveTo(start).arcTo(radius, end, largeArc, true);

  return builder.build();
}

/**
 * Generate half-circle arcs with bridges (for expansion patterns)
 * This creates the nested semicircle pattern seen in some samples
 */
export function generateHalfCircleRings(
  center: Point2D,
  radii: number[],
  bridgeWidth: number,
  topHalf: boolean = true
): string[] {
  const paths: string[] = [];

  for (const radius of radii) {
    const bridgeGap = bridgeWidth / radius;

    if (topHalf) {
      // Top half: -PI/2 to PI/2 (with bridges at ends)
      const startAngle = -Math.PI / 2 + bridgeGap / 2;
      const endAngle = Math.PI / 2 - bridgeGap / 2;
      paths.push(generateArc(center, radius, startAngle, endAngle));
    } else {
      // Bottom half: PI/2 to 3*PI/2 (with bridges at ends)
      const startAngle = Math.PI / 2 + bridgeGap / 2;
      const endAngle = (3 * Math.PI) / 2 - bridgeGap / 2;
      paths.push(generateArc(center, radius, startAngle, endAngle));
    }
  }

  return paths;
}

/**
 * Generate bridge connectors between rings
 * Useful for expansion patterns that need physical connections
 */
export function generateBridgeConnectors(
  center: Point2D,
  innerRadius: number,
  outerRadius: number,
  count: number,
  startAngle: number = 0
): string[] {
  const paths: string[] = [];
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep;
    const innerPoint = pointOnCircle(center, innerRadius, angle);
    const outerPoint = pointOnCircle(center, outerRadius, angle);

    const builder = new PathBuilder();
    builder.moveTo(innerPoint).lineTo(outerPoint);
    paths.push(builder.build());
  }

  return paths;
}
