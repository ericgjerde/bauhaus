/**
 * Concentric polygon pattern generator
 * Creates nested polygon patterns (hexagons, pentagons, dodecagons, etc.)
 */

import {
  degToRad,
  pointOnCircle,
  PathBuilder,
  type Point2D,
} from '@bauhaus/core';

import type {
  PolygonPatternConfig,
  GeneratedPolygon,
  GeneratedPolygonPattern,
} from './types.js';
import { DEFAULT_POLYGON_CONFIG } from './types.js';
import { calculatePolygonRadii } from './spacing.js';

/**
 * Generate a complete concentric polygon pattern from configuration
 */
export function generatePolygonPattern(
  config: Partial<PolygonPatternConfig> = {}
): GeneratedPolygonPattern {
  const cfg = { ...DEFAULT_POLYGON_CONFIG, ...config };

  // Default center to middle of pattern
  const center = cfg.center || {
    x: cfg.outerRadius,
    y: cfg.outerRadius,
  };

  // Calculate all polygon radii (from outer to inner)
  const radii = calculatePolygonRadii(cfg.outerRadius, cfg.polygonCount, cfg.spacingMode, {
    innerRadius: cfg.innerRadius,
    outerGap: cfg.outerGap,
    shrinkage: cfg.shrinkage,
  });

  // Generate each polygon
  const polygons: GeneratedPolygon[] = radii.map((radius, index) => {
    const pathData = cfg.bridgeCount > 0
      ? generatePolygonWithBridges(center, radius, cfg.sides, cfg.rotation, cfg.bridgeCount, cfg.bridgeWidth)
      : generatePolygon(center, radius, cfg.sides, cfg.rotation);

    return {
      index,
      radius,
      sides: cfg.sides,
      pathData,
    };
  });

  // Generate outer boundary if enabled
  let outerBoundary: string | undefined;
  if (cfg.showOuterBoundary) {
    outerBoundary = generatePolygon(center, cfg.outerRadius, cfg.sides, cfg.rotation);
  }

  return {
    polygons,
    outerBoundary,
    center,
    radii,
  };
}

/**
 * Get vertices of a regular polygon
 */
export function getPolygonVertices(
  center: Point2D,
  radius: number,
  sides: number,
  rotationDeg: number = 0
): Point2D[] {
  const vertices: Point2D[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const startAngle = degToRad(rotationDeg) - Math.PI / 2; // Start from top

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    vertices.push(pointOnCircle(center, radius, angle));
  }

  return vertices;
}

/**
 * Generate a simple polygon path
 */
export function generatePolygon(
  center: Point2D,
  radius: number,
  sides: number,
  rotationDeg: number = 0
): string {
  const vertices = getPolygonVertices(center, radius, sides, rotationDeg);

  const builder = new PathBuilder();
  builder.moveTo(vertices[0]);

  for (let i = 1; i < vertices.length; i++) {
    builder.lineTo(vertices[i]);
  }

  builder.closePath();
  return builder.build();
}

/**
 * Generate a polygon with bridge gaps for expandable mesh pattern
 */
export function generatePolygonWithBridges(
  center: Point2D,
  radius: number,
  sides: number,
  rotationDeg: number = 0,
  bridgeCount: number = 6,
  bridgeWidth: number = 8
): string {
  const vertices = getPolygonVertices(center, radius, sides, rotationDeg);
  const paths: string[] = [];

  // Calculate bridge positions
  // Bridges can be at vertices or along edges
  const bridgesPerEdge = Math.floor(bridgeCount / sides);
  const bridgeGap = bridgeWidth / 2;

  for (let i = 0; i < sides; i++) {
    const startVertex = vertices[i];
    const endVertex = vertices[(i + 1) % sides];

    // Calculate edge length
    const edgeLength = distance(startVertex, endVertex);

    if (bridgesPerEdge === 0) {
      // No bridges on this edge, draw full edge
      const builder = new PathBuilder();
      builder.moveTo(startVertex).lineTo(endVertex);
      paths.push(builder.build());
    } else {
      // Draw edge segments with bridge gaps
      const segmentLength = edgeLength / (bridgesPerEdge + 1);

      for (let j = 0; j <= bridgesPerEdge; j++) {
        const tStart = j === 0 ? 0 : (j * segmentLength + bridgeGap) / edgeLength;
        const tEnd = j === bridgesPerEdge ? 1 : ((j + 1) * segmentLength - bridgeGap) / edgeLength;

        if (tStart < tEnd) {
          const segStart = interpolate(startVertex, endVertex, tStart);
          const segEnd = interpolate(startVertex, endVertex, tEnd);

          const builder = new PathBuilder();
          builder.moveTo(segStart).lineTo(segEnd);
          paths.push(builder.build());
        }
      }
    }
  }

  return paths.join(' ');
}

/**
 * Calculate distance between two points
 */
function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
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
