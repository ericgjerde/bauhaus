/**
 * Configuration types for concentric polygon pattern generation
 * Supports hexagons (6), pentagons (5), octagons (8), dodecagons (12), etc.
 */

export type PolygonSpacingMode = 'uniform' | 'shrinkage' | 'graduated';

export type PolygonSides = 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12;

export interface PolygonPatternConfig {
  /** Number of sides (3=triangle, 5=pentagon, 6=hexagon, 8=octagon, 12=dodecagon) */
  sides: PolygonSides;

  /** Outer radius in pixels (center to vertex) */
  outerRadius: number;

  /** Inner radius where pattern stops */
  innerRadius: number;

  /** Number of concentric polygons */
  polygonCount: number;

  /** How polygons are spaced */
  spacingMode: PolygonSpacingMode;

  /**
   * Outer gap size in pixels (spacing for outermost polygon)
   * Used when spacingMode is 'shrinkage'
   */
  outerGap: number;

  /**
   * Shrinkage factor per polygon (0-1)
   * Each inner gap = previous gap * (1 - shrinkage)
   */
  shrinkage: number;

  /**
   * Rotation of the entire pattern in degrees
   */
  rotation: number;

  /**
   * Number of bridge/cut points per polygon (0 = solid)
   * Creates gaps for expandable mesh
   */
  bridgeCount: number;

  /** Width of bridges/connectors in pixels */
  bridgeWidth: number;

  /** Whether to show outer boundary polygon */
  showOuterBoundary: boolean;

  /** Center point (defaults to center of canvas) */
  center?: { x: number; y: number };
}

export const DEFAULT_POLYGON_CONFIG: PolygonPatternConfig = {
  sides: 6,             // Hexagon
  outerRadius: 360,     // 5 inches at 72 DPI
  innerRadius: 36,      // 0.5 inches
  polygonCount: 10,
  spacingMode: 'shrinkage',
  outerGap: 24,
  shrinkage: 0.05,
  rotation: 0,
  bridgeCount: 0,       // Solid polygons by default
  bridgeWidth: 8,
  showOuterBoundary: true,
};

/** Generated polygon data */
export interface GeneratedPolygon {
  /** Polygon index (0 = outermost) */
  index: number;
  /** Polygon radius (center to vertex) */
  radius: number;
  /** Number of sides */
  sides: number;
  /** SVG path d attribute for this polygon */
  pathData: string;
}

/** Complete generated pattern */
export interface GeneratedPolygonPattern {
  /** All generated polygons */
  polygons: GeneratedPolygon[];
  /** Outer boundary path (if enabled) */
  outerBoundary?: string;
  /** Center point used */
  center: { x: number; y: number };
  /** Computed polygon radii */
  radii: number[];
}

/** Preset polygon types */
export const POLYGON_PRESETS = {
  triangle: 3,
  square: 4,
  pentagon: 5,
  hexagon: 6,
  heptagon: 7,
  octagon: 8,
  decagon: 10,
  dodecagon: 12,
} as const;
