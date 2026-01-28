/**
 * Unit conversion utilities for laser cutting
 *
 * Standard DPI for laser cutting SVGs is 72 (matches Illustrator)
 * This means 1 inch = 72 pixels
 */

export const DPI = 72;

export type Unit = 'inches' | 'mm' | 'px';

/** Convert inches to pixels (at 72 DPI) */
export function inchesToPixels(inches: number): number {
  return inches * DPI;
}

/** Convert pixels to inches (at 72 DPI) */
export function pixelsToInches(pixels: number): number {
  return pixels / DPI;
}

/** Convert mm to pixels (at 72 DPI) */
export function mmToPixels(mm: number): number {
  return (mm / 25.4) * DPI;
}

/** Convert pixels to mm (at 72 DPI) */
export function pixelsToMm(pixels: number): number {
  return (pixels / DPI) * 25.4;
}

/** Convert between any units */
export function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;

  // First convert to pixels
  let pixels: number;
  switch (from) {
    case 'inches':
      pixels = inchesToPixels(value);
      break;
    case 'mm':
      pixels = mmToPixels(value);
      break;
    case 'px':
      pixels = value;
      break;
  }

  // Then convert to target unit
  switch (to) {
    case 'inches':
      return pixelsToInches(pixels);
    case 'mm':
      return pixelsToMm(pixels);
    case 'px':
      return pixels;
  }
}

/** Format value with unit suffix */
export function formatWithUnit(value: number, unit: Unit, decimals: number = 2): string {
  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  switch (unit) {
    case 'inches':
      return `${rounded}in`;
    case 'mm':
      return `${rounded}mm`;
    case 'px':
      return `${rounded}px`;
  }
}
