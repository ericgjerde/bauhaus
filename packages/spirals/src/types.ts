/**
 * Configuration types for multi-arm spiral pattern generation
 * Based on Bauhaus bezier spiral patterns (4-plex, 8-plex, 16-plex)
 */

export type SpiralType = 'logarithmic' | 'archimedean' | 'fermat';

export interface SpiralPatternConfig {
  /** Number of spiral arms (4, 8, 16 are common) */
  armCount: number;

  /** Outer radius in pixels */
  outerRadius: number;

  /** Inner radius where spirals start */
  innerRadius: number;

  /** Number of turns from inner to outer radius */
  turns: number;

  /** Type of spiral curve */
  spiralType: SpiralType;

  /**
   * Growth factor for logarithmic spirals
   * Higher values = faster expansion
   */
  growthFactor: number;

  /**
   * Rotation offset of the entire pattern in degrees
   */
  rotation: number;

  /**
   * Line width for the spiral paths (visual, not cut width)
   */
  strokeWidth: number;

  /** Whether to show outer boundary circle */
  showOuterBoundary: boolean;

  /** Center point (defaults to center of canvas) */
  center?: { x: number; y: number };
}

export const DEFAULT_SPIRAL_CONFIG: SpiralPatternConfig = {
  armCount: 4,
  outerRadius: 360,
  innerRadius: 10,
  turns: 3,
  spiralType: 'logarithmic',
  growthFactor: 0.2,
  rotation: 0,
  strokeWidth: 1,
  showOuterBoundary: true,
};

/** Generated spiral arm data */
export interface GeneratedSpiralArm {
  /** Arm index (0 to armCount-1) */
  index: number;
  /** Starting angle in radians */
  startAngle: number;
  /** SVG path d attribute for this arm */
  pathData: string;
}

/** Complete generated pattern */
export interface GeneratedSpiralPattern {
  /** All generated spiral arms */
  arms: GeneratedSpiralArm[];
  /** Outer boundary path (if enabled) */
  outerBoundary?: string;
  /** Center point used */
  center: { x: number; y: number };
}
