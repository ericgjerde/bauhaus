/**
 * Configuration types for concentric square pattern generation
 */

export type SquareSpacingMode = 'uniform' | 'shrinkage' | 'graduated';

export interface SquarePatternConfig {
  /** Outer size (half-width) in pixels - distance from center to edge */
  outerSize: number;

  /** Inner size where pattern stops */
  innerSize: number;

  /** Number of concentric squares */
  squareCount: number;

  /** How squares are spaced */
  spacingMode: SquareSpacingMode;

  /**
   * Outer gap size in pixels (spacing for outermost square)
   * Used when spacingMode is 'shrinkage'
   */
  outerGap: number;

  /**
   * Shrinkage factor per square (0-1)
   * Each inner gap = previous gap * (1 - shrinkage)
   */
  shrinkage: number;

  /**
   * Rotation of the entire pattern in degrees
   * 45 creates diamond orientation
   */
  rotation: number;

  /**
   * Whether to alternate direction (clockwise/counter-clockwise)
   * for the polyline paths
   */
  alternating: boolean;

  /**
   * Number of notches/cuts per side (0 = no cuts)
   * Creates the expandable mesh pattern
   */
  notchesPerSide: number;

  /** Width of notches/cuts in pixels */
  notchWidth: number;

  /** Whether to show outer boundary square */
  showOuterBoundary: boolean;

  /** Center point (defaults to center of canvas) */
  center?: { x: number; y: number };
}

export const DEFAULT_SQUARE_CONFIG: SquarePatternConfig = {
  outerSize: 360,       // 5 inches at 72 DPI
  innerSize: 36,        // 0.5 inches
  squareCount: 10,
  spacingMode: 'shrinkage',
  outerGap: 24,
  shrinkage: 0.05,
  rotation: 0,
  alternating: true,
  notchesPerSide: 0,
  notchWidth: 8,
  showOuterBoundary: true,
};

/** Generated square data */
export interface GeneratedSquare {
  /** Square index (0 = outermost) */
  index: number;
  /** Square half-size (distance from center to edge) */
  size: number;
  /** Direction: true = clockwise, false = counter-clockwise */
  clockwise: boolean;
  /** SVG path d attribute for this square */
  pathData: string;
}

/** Complete generated pattern */
export interface GeneratedSquarePattern {
  /** All generated squares */
  squares: GeneratedSquare[];
  /** Outer boundary path (if enabled) */
  outerBoundary?: string;
  /** Center point used */
  center: { x: number; y: number };
  /** Computed square sizes */
  sizes: number[];
}
