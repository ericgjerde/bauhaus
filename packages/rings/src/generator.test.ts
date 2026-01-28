import { describe, it, expect } from 'vitest';
import { generateRingPattern, calculateStaggeredRotation, generateRingWithCuts } from './generator';
import { DEFAULT_CONFIG, type RingPatternConfig } from './types';

describe('generateRingPattern', () => {
  it('generates correct number of rings', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 5,
    };
    const result = generateRingPattern(config);
    expect(result.rings).toHaveLength(5);
  });

  it('generates single ring', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 1,
    };
    const result = generateRingPattern(config);
    expect(result.rings).toHaveLength(1);
  });

  it('generates no rings when count is 0', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 0,
    };
    const result = generateRingPattern(config);
    expect(result.rings).toHaveLength(0);
  });

  it('generates outer boundary when enabled', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      showOuterBoundary: true,
    };
    const result = generateRingPattern(config);
    expect(result.outerBoundary).toBeDefined();
    expect(result.outerBoundary).toContain('M');
  });

  it('does not generate outer boundary when disabled', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      showOuterBoundary: false,
    };
    const result = generateRingPattern(config);
    expect(result.outerBoundary).toBeUndefined();
  });

  it('rings have decreasing radii from outer to inner', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 10,
      spacingMode: 'shrinkage',
    };
    const result = generateRingPattern(config);

    for (let i = 1; i < result.rings.length; i++) {
      expect(result.rings[i].radius).toBeLessThan(result.rings[i - 1].radius);
    }
  });

  it('first ring radius equals outerRadius', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      outerRadius: 300,
      ringCount: 5,
    };
    const result = generateRingPattern(config);
    expect(result.rings[0].radius).toBe(300);
  });

  it('generates segmented paths when cutCount > 0 (except outermost ring)', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 2,
      cutCount: 4,
    };
    const result = generateRingPattern(config);

    // Outermost ring (index 0) is always solid for structural integrity
    const outerMoveCount = (result.rings[0].pathData.match(/M/g) || []).length;
    expect(outerMoveCount).toBe(1); // Single circle path

    // Inner rings get segmented with cuts
    const innerMoveCount = (result.rings[1].pathData.match(/M/g) || []).length;
    expect(innerMoveCount).toBe(4); // 4 arc segments
  });

  it('generates correct center point', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      outerRadius: 200,
    };
    const result = generateRingPattern(config);

    expect(result.center.x).toBe(200);
    expect(result.center.y).toBe(200);
  });

  it('handles shrinkage spacing correctly', () => {
    const config: RingPatternConfig = {
      ...DEFAULT_CONFIG,
      ringCount: 5,
      spacingMode: 'shrinkage',
      outerGap: 20,
      shrinkage: 0.1,
    };
    const result = generateRingPattern(config);

    expect(result.rings).toHaveLength(5);

    // Verify gaps are decreasing
    for (let i = 2; i < result.rings.length; i++) {
      const prevGap = result.rings[i - 2].radius - result.rings[i - 1].radius;
      const currGap = result.rings[i - 1].radius - result.rings[i].radius;
      expect(currGap).toBeLessThan(prevGap);
    }
  });
});

describe('calculateStaggeredRotation', () => {
  it('returns 0 for even ring indices', () => {
    expect(calculateStaggeredRotation(0, 16, 1)).toBe(0);
    expect(calculateStaggeredRotation(2, 16, 1)).toBe(0);
    expect(calculateStaggeredRotation(4, 16, 1)).toBe(0);
  });

  it('returns offset for odd ring indices', () => {
    const gridAngle = (2 * Math.PI) / 16;
    expect(calculateStaggeredRotation(1, 16, 1)).toBeCloseTo(gridAngle);
    expect(calculateStaggeredRotation(3, 16, 1)).toBeCloseTo(gridAngle);
  });

  it('scales offset by grid divisions', () => {
    const gridAngle8 = (2 * Math.PI) / 8;
    const gridAngle16 = (2 * Math.PI) / 16;

    expect(calculateStaggeredRotation(1, 8, 1)).toBeCloseTo(gridAngle8);
    expect(calculateStaggeredRotation(1, 16, 1)).toBeCloseTo(gridAngle16);
  });

  it('multiplies stagger offset', () => {
    const gridAngle = (2 * Math.PI) / 16;

    expect(calculateStaggeredRotation(1, 16, 2)).toBeCloseTo(gridAngle * 2);
    expect(calculateStaggeredRotation(1, 16, 3)).toBeCloseTo(gridAngle * 3);
  });
});

describe('generateRingWithCuts', () => {
  const center = { x: 100, y: 100 };

  it('generates full circle when cutCount is 0', () => {
    const path = generateRingWithCuts(center, 50, 0, 5);
    expect(path).toContain('M');
    expect(path).toContain('A');
  });

  it('generates correct number of arc segments', () => {
    const path = generateRingWithCuts(center, 50, 8, 5);
    const moveCount = (path.match(/M/g) || []).length;
    expect(moveCount).toBe(8);
  });

  it('applies rotation offset', () => {
    const pathNoRotation = generateRingWithCuts(center, 50, 4, 5, 0);
    const pathWithRotation = generateRingWithCuts(center, 50, 4, 5, Math.PI / 4);

    // Paths should be different due to rotation
    expect(pathNoRotation).not.toBe(pathWithRotation);
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has sensible defaults', () => {
    expect(DEFAULT_CONFIG.outerRadius).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.ringCount).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.cutCount).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CONFIG.gridDivisions).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.shrinkage).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CONFIG.shrinkage).toBeLessThan(1);
  });
});
