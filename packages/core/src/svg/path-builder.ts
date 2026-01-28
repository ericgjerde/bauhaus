/**
 * SVG path builder for generating d attribute strings
 */

import type { Point2D, Arc } from '../geometry/types.js';
import { pointOnCircle, round } from '../geometry/math.js';

export class PathBuilder {
  private commands: string[] = [];

  /** Move to a point */
  moveTo(p: Point2D): this {
    this.commands.push(`M${round(p.x, 2)},${round(p.y, 2)}`);
    return this;
  }

  /** Line to a point */
  lineTo(p: Point2D): this {
    this.commands.push(`L${round(p.x, 2)},${round(p.y, 2)}`);
    return this;
  }

  /** Draw an arc */
  arcTo(
    radius: number,
    endPoint: Point2D,
    largeArc: boolean = false,
    sweep: boolean = true
  ): this {
    const rx = round(radius, 2);
    const ry = round(radius, 2);
    const xAxisRotation = 0;
    const largeArcFlag = largeArc ? 1 : 0;
    const sweepFlag = sweep ? 1 : 0;
    const x = round(endPoint.x, 2);
    const y = round(endPoint.y, 2);

    this.commands.push(
      `A${rx},${ry} ${xAxisRotation} ${largeArcFlag},${sweepFlag} ${x},${y}`
    );
    return this;
  }

  /** Close the path */
  closePath(): this {
    this.commands.push('Z');
    return this;
  }

  /** Build the d attribute string */
  build(): string {
    return this.commands.join(' ');
  }

  /** Reset the builder */
  reset(): this {
    this.commands = [];
    return this;
  }
}

/**
 * Generate SVG path d attribute for an arc
 */
export function arcToPath(arc: Arc): string {
  const builder = new PathBuilder();
  const startPoint = pointOnCircle(arc.center, arc.radius, arc.startAngle);
  const endPoint = pointOnCircle(arc.center, arc.radius, arc.endAngle);

  // Calculate sweep angle
  let sweepAngle = arc.endAngle - arc.startAngle;
  if (arc.clockwise) {
    if (sweepAngle > 0) sweepAngle -= 2 * Math.PI;
  } else {
    if (sweepAngle < 0) sweepAngle += 2 * Math.PI;
  }

  const largeArc = Math.abs(sweepAngle) > Math.PI;
  const sweepFlag = !arc.clockwise;

  builder
    .moveTo(startPoint)
    .arcTo(arc.radius, endPoint, largeArc, sweepFlag);

  return builder.build();
}

/**
 * Generate SVG path d attribute for a full circle
 */
export function circleToPath(center: Point2D, radius: number): string {
  // SVG arcs can't draw a full circle, so we draw two semicircles
  const top = { x: center.x, y: center.y - radius };
  const bottom = { x: center.x, y: center.y + radius };

  const builder = new PathBuilder();
  builder
    .moveTo(top)
    .arcTo(radius, bottom, true, true)
    .arcTo(radius, top, true, true)
    .closePath();

  return builder.build();
}

/**
 * Generate SVG path d attribute for a line
 */
export function lineToPath(start: Point2D, end: Point2D): string {
  return new PathBuilder().moveTo(start).lineTo(end).build();
}
