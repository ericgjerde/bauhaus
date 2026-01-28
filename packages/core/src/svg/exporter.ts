/**
 * SVG exporter with kerf compensation for laser cutting
 */

import type { Unit } from '../geometry/units.js';
import { inchesToPixels, pixelsToInches, DPI } from '../geometry/units.js';

export interface ExportOptions {
  /** Width in specified units */
  width: number;
  /** Height in specified units */
  height: number;
  /** Unit for dimensions */
  unit: Unit;
  /** Kerf allowance in inches (expands cut lines outward) */
  kerfAllowance?: number;
  /** Stroke color for cut lines */
  strokeColor?: string;
  /** Stroke width in inches (typically hairline: 0.001) */
  strokeWidth?: number;
  /** Background color (none for transparent) */
  backgroundColor?: string;
}

export interface SVGPath {
  /** SVG path d attribute */
  d: string;
  /** Stroke color override */
  stroke?: string;
  /** Path ID for reference */
  id?: string;
}

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  width: 10,
  height: 10,
  unit: 'inches',
  kerfAllowance: 0,
  strokeColor: '#FF0000', // Red for cut lines
  strokeWidth: 0.001, // Hairline
  backgroundColor: 'none',
};

/**
 * Generate a complete SVG document for laser cutting
 */
export function exportSVG(paths: SVGPath[], options: ExportOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Calculate pixel dimensions
  let widthPx: number;
  let heightPx: number;

  if (opts.unit === 'inches') {
    widthPx = inchesToPixels(opts.width);
    heightPx = inchesToPixels(opts.height);
  } else if (opts.unit === 'mm') {
    widthPx = (opts.width / 25.4) * DPI;
    heightPx = (opts.height / 25.4) * DPI;
  } else {
    widthPx = opts.width;
    heightPx = opts.height;
  }

  // Format physical dimensions
  const widthAttr = opts.unit === 'px' ? `${opts.width}` : `${opts.width}${opts.unit === 'inches' ? 'in' : 'mm'}`;
  const heightAttr = opts.unit === 'px' ? `${opts.height}` : `${opts.height}${opts.unit === 'inches' ? 'in' : 'mm'}`;

  // Build SVG
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    `     width="${widthAttr}" height="${heightAttr}"`,
    `     viewBox="0 0 ${Math.round(widthPx)} ${Math.round(heightPx)}">`,
  ];

  // Add background if specified
  if (opts.backgroundColor && opts.backgroundColor !== 'none') {
    lines.push(`  <rect width="100%" height="100%" fill="${opts.backgroundColor}"/>`);
  }

  // Stroke width in pixels
  const strokeWidthPx = inchesToPixels(opts.strokeWidth);

  // Add paths
  for (const path of paths) {
    const stroke = path.stroke || opts.strokeColor;
    const idAttr = path.id ? ` id="${path.id}"` : '';
    lines.push(
      `  <path${idAttr} d="${path.d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidthPx}"/>`
    );
  }

  lines.push('</svg>');

  return lines.join('\n');
}

/**
 * Apply kerf compensation to a circle radius
 * For outer cuts, increase radius by kerf/2
 * For inner cuts, decrease radius by kerf/2
 */
export function applyKerf(radius: number, kerfInches: number, isOuterCut: boolean): number {
  const kerfPx = inchesToPixels(kerfInches);
  const adjustment = kerfPx / 2;
  return isOuterCut ? radius + adjustment : radius - adjustment;
}

/**
 * Create a downloadable SVG blob URL
 */
export function createDownloadUrl(svgContent: string): string {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

/**
 * Trigger download of SVG file
 */
export function downloadSVG(svgContent: string, filename: string): void {
  const url = createDownloadUrl(svgContent);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
