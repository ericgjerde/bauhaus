import { describe, it, expect } from 'vitest';
import {
  degToRad,
  radToDeg,
  pointOnCircle,
  lerp,
  PHI,
  distance,
  normalizeAngle,
  boundingBox,
  round,
} from './math';

describe('degToRad', () => {
  it('converts 0 degrees to 0 radians', () => {
    expect(degToRad(0)).toBe(0);
  });

  it('converts 90 degrees to PI/2 radians', () => {
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });

  it('converts 180 degrees to PI radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
  });

  it('converts 360 degrees to 2*PI radians', () => {
    expect(degToRad(360)).toBeCloseTo(Math.PI * 2);
  });
});

describe('radToDeg', () => {
  it('converts 0 radians to 0 degrees', () => {
    expect(radToDeg(0)).toBe(0);
  });

  it('converts PI/2 radians to 90 degrees', () => {
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it('converts PI radians to 180 degrees', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });
});

describe('pointOnCircle', () => {
  it('returns center point for zero radius', () => {
    const result = pointOnCircle({ x: 100, y: 100 }, 0, 0);
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(100);
  });

  it('calculates correct position for 0 radians', () => {
    const result = pointOnCircle({ x: 0, y: 0 }, 100, 0);
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(0);
  });

  it('calculates correct position for PI/2 radians', () => {
    const result = pointOnCircle({ x: 0, y: 0 }, 100, Math.PI / 2);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(100);
  });

  it('calculates correct position for PI radians', () => {
    const result = pointOnCircle({ x: 0, y: 0 }, 100, Math.PI);
    expect(result.x).toBeCloseTo(-100);
    expect(result.y).toBeCloseTo(0);
  });

  it('calculates correct position for 3*PI/2 radians', () => {
    const result = pointOnCircle({ x: 0, y: 0 }, 100, (3 * Math.PI) / 2);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(-100);
  });
});

describe('lerp', () => {
  it('returns start at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns end at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe('PHI', () => {
  it('equals the golden ratio', () => {
    expect(PHI).toBeCloseTo(1.618033988749895);
  });
});

describe('distance', () => {
  it('returns 0 for same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
  });

  it('calculates vertical distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(10);
  });

  it('calculates diagonal distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('normalizeAngle', () => {
  it('keeps angle in range unchanged', () => {
    expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
  });

  it('normalizes negative angle', () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);
  });

  it('normalizes angle greater than 2*PI', () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
  });
});

describe('boundingBox', () => {
  it('returns zero box for empty array', () => {
    const box = boundingBox([]);
    expect(box.width).toBe(0);
    expect(box.height).toBe(0);
  });

  it('calculates bounding box for points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 15 },
    ];
    const box = boundingBox(points);
    expect(box.minX).toBe(0);
    expect(box.minY).toBe(0);
    expect(box.maxX).toBe(10);
    expect(box.maxY).toBe(15);
    expect(box.width).toBe(10);
    expect(box.height).toBe(15);
  });
});

describe('round', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(round(3.14159)).toBe(3.14);
  });

  it('rounds to specified decimal places', () => {
    expect(round(3.14159, 3)).toBe(3.142);
  });

  it('rounds to 0 decimal places', () => {
    expect(round(3.7, 0)).toBe(4);
  });
});
