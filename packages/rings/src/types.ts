/**
 * Configuration types for ring pattern generation
 */

export type SpacingMode = 'uniform' | 'shrinkage' | 'graduated' | 'goldenRatio';

export interface RingPatternConfig {
  /** Outer radius in pixels (at 72 DPI) */
  outerRadius: number;

  /** Inner radius where pattern stops (optional - can auto-calculate from ring count) */
  innerRadius: number;

  /** Number of concentric rings */
  ringCount: number;

  /** How rings are spaced */
  spacingMode: SpacingMode;

  /**
   * Outer gap size in pixels (base spacing for outermost ring gap)
   * Used when spacingMode is 'shrinkage'
   */
  outerGap: number;

  /**
   * Shrinkage factor per ring (0-1)
   * Each inner gap = previous gap * (1 - shrinkage)
   * e.g., 0.1 means each gap is 90% of the previous
   */
  shrinkage: number;

  /** Number of cuts per ring */
  cutCount: number;

  /**
   * Grid divisions for cut alignment (e.g., 16 = 16ths of circle)
   * Cuts snap to these grid positions
   */
  gridDivisions: number;

  /**
   * Stagger offset for alternating rings
   * Odd rings use grid position 0, even rings use this offset
   * e.g., 1 means even rings are offset by 1 grid position
   */
  staggerOffset: number;

  /** Width of cuts/gaps in pixels */
  cutWidth: number;

  /** Whether to show outer boundary circle */
  showOuterBoundary: boolean;

  /** Center point (defaults to center of canvas) */
  center?: { x: number; y: number };
}

export const DEFAULT_CONFIG: RingPatternConfig = {
  outerRadius: 360,      // 5 inches at 72 DPI
  innerRadius: 36,       // 0.5 inches
  ringCount: 10,
  spacingMode: 'shrinkage',
  outerGap: 18,          // ~0.25 inches at 72 DPI
  shrinkage: 0.05,       // 5% smaller each ring inward
  cutCount: 8,
  gridDivisions: 16,
  staggerOffset: 1,
  cutWidth: 8,
  showOuterBoundary: true,
};

/** Generated ring data */
export interface GeneratedRing {
  /** Ring index (0 = outermost) */
  index: number;
  /** Ring radius */
  radius: number;
  /** Rotation offset for this ring in radians */
  rotation: number;
  /** SVG path d attribute for this ring */
  pathData: string;
}

/** Complete generated pattern */
export interface GeneratedPattern {
  /** All generated rings */
  rings: GeneratedRing[];
  /** Outer boundary path (if enabled) */
  outerBoundary?: string;
  /** Center point used */
  center: { x: number; y: number };
  /** Computed ring radii */
  radii: number[];
}
