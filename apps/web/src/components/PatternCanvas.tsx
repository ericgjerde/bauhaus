import React, { useMemo, useRef, useCallback } from 'react';
import { generateRingPattern } from '@bauhaus/rings';
import { generateSquarePattern } from '@bauhaus/squares';
import { generatePolygonPattern } from '@bauhaus/polygons';
import { generateSpiralPattern } from '@bauhaus/spirals';
import { usePatternStore } from '../store';

export function PatternCanvas() {
  const patternType = usePatternStore((s) => s.patternType);
  const ringConfig = usePatternStore((s) => s.ringConfig);
  const squareConfig = usePatternStore((s) => s.squareConfig);
  const polygonConfig = usePatternStore((s) => s.polygonConfig);
  const spiralConfig = usePatternStore((s) => s.spiralConfig);
  const zoom = usePatternStore((s) => s.zoom);
  const panX = usePatternStore((s) => s.panX);
  const panY = usePatternStore((s) => s.panY);
  const setZoom = usePatternStore((s) => s.setZoom);
  const setPan = usePatternStore((s) => s.setPan);

  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // Generate pattern based on current type
  const { paths, outerBoundary, center, canvasSize } = useMemo(() => {
    switch (patternType) {
      case 'rings': {
        const pattern = generateRingPattern(ringConfig);
        return {
          paths: pattern.rings.map((ring) => ring.pathData),
          outerBoundary: pattern.outerBoundary,
          center: pattern.center,
          canvasSize: ringConfig.outerRadius * 2 + 40,
        };
      }
      case 'squares': {
        const pattern = generateSquarePattern(squareConfig);
        return {
          paths: pattern.squares.map((sq) => sq.pathData),
          outerBoundary: pattern.outerBoundary,
          center: pattern.center,
          canvasSize: squareConfig.outerSize * 2 + 40,
        };
      }
      case 'polygons': {
        const pattern = generatePolygonPattern(polygonConfig);
        return {
          paths: pattern.polygons.map((poly) => poly.pathData),
          outerBoundary: pattern.outerBoundary,
          center: pattern.center,
          canvasSize: polygonConfig.outerRadius * 2 + 40,
        };
      }
      case 'spirals': {
        const pattern = generateSpiralPattern(spiralConfig);
        return {
          paths: pattern.arms.map((arm) => arm.pathData),
          outerBoundary: pattern.outerBoundary,
          center: pattern.center,
          canvasSize: spiralConfig.outerRadius * 2 + 40,
        };
      }
    }
  }, [patternType, ringConfig, squareConfig, polygonConfig, spiralConfig]);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(zoom * delta);
    },
    [zoom, setZoom]
  );

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanning.current = true;
      lastPan.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPan.current.x;
        const dy = e.clientY - lastPan.current.y;
        setPan(panX + dx, panY + dy);
        lastPan.current = { x: e.clientX, y: e.clientY };
      }
    },
    [panX, panY, setPan]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  return (
    <div
      className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        className="max-w-full max-h-full"
        style={{
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          cursor: isPanning.current ? 'grabbing' : 'grab',
          width: '100%',
          height: '100%',
          maxWidth: '800px',
          maxHeight: '800px',
        }}
      >
        {/* Background */}
        <rect width={canvasSize} height={canvasSize} fill="white" />

        {/* Center the pattern */}
        <g transform={`translate(20, 20)`}>
          {/* Outer boundary */}
          {outerBoundary && (
            <path
              d={outerBoundary}
              fill="none"
              stroke="#FFCC00"
              strokeWidth="1"
            />
          )}

          {/* Pattern paths */}
          {paths.map((pathData, index) => (
            <path
              key={index}
              d={pathData}
              fill="none"
              stroke="#E30613"
              strokeWidth="1"
            />
          ))}

          {/* Center point indicator */}
          <circle
            cx={center.x}
            cy={center.y}
            r="3"
            fill="#0057B8"
          />
        </g>
      </svg>
    </div>
  );
}
