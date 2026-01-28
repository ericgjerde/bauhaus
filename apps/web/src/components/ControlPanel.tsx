import React, { useCallback, useState } from 'react';
import { exportSVG, pixelsToInches, inchesToPixels, type SVGPath } from '@bauhaus/core';
import { generateRingPattern, type SpacingMode, type RingPatternConfig } from '@bauhaus/rings';
import { generateSquarePattern, type SquareSpacingMode, type SquarePatternConfig } from '@bauhaus/squares';
import { generatePolygonPattern, type PolygonSpacingMode, type PolygonPatternConfig, type PolygonSides } from '@bauhaus/polygons';
import { generateSpiralPattern, type SpiralType, type SpiralPatternConfig } from '@bauhaus/spirals';
import { usePatternStore, type PatternType } from '../store';
import { builtInPresets, savePreset, type Preset } from '../presets';
import { Slider } from './Slider';
import { Select } from './Select';
import { NumberInput } from './NumberInput';
import { Toggle } from './Toggle';

const PATTERN_TYPE_OPTIONS = [
  { value: 'rings', label: 'Concentric Rings' },
  { value: 'squares', label: 'Concentric Squares' },
  { value: 'polygons', label: 'Polygon Rings' },
  { value: 'spirals', label: 'Multi-arm Spirals' },
];

const RING_SPACING_OPTIONS = [
  { value: 'shrinkage', label: 'Shrinkage (%)' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'goldenRatio', label: 'Golden Ratio' },
];

const SQUARE_SPACING_OPTIONS = [
  { value: 'shrinkage', label: 'Shrinkage (%)' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'graduated', label: 'Graduated' },
];

const POLYGON_SIDES_OPTIONS = [
  { value: '3', label: 'Triangle (3)' },
  { value: '5', label: 'Pentagon (5)' },
  { value: '6', label: 'Hexagon (6)' },
  { value: '8', label: 'Octagon (8)' },
  { value: '10', label: 'Decagon (10)' },
  { value: '12', label: 'Dodecagon (12)' },
];

const SPIRAL_TYPE_OPTIONS = [
  { value: 'logarithmic', label: 'Logarithmic' },
  { value: 'archimedean', label: 'Archimedean' },
  { value: 'fermat', label: 'Fermat' },
];

export function ControlPanel() {
  const patternType = usePatternStore((s) => s.patternType);
  const setPatternType = usePatternStore((s) => s.setPatternType);

  const ringConfig = usePatternStore((s) => s.ringConfig);
  const setRingConfig = usePatternStore((s) => s.setRingConfig);

  const squareConfig = usePatternStore((s) => s.squareConfig);
  const setSquareConfig = usePatternStore((s) => s.setSquareConfig);

  const polygonConfig = usePatternStore((s) => s.polygonConfig);
  const setPolygonConfig = usePatternStore((s) => s.setPolygonConfig);

  const spiralConfig = usePatternStore((s) => s.spiralConfig);
  const setSpiralConfig = usePatternStore((s) => s.setSpiralConfig);

  const kerfAllowance = usePatternStore((s) => s.kerfAllowance);
  const setKerfAllowance = usePatternStore((s) => s.setKerfAllowance);
  const resetConfig = usePatternStore((s) => s.resetConfig);
  const resetView = usePatternStore((s) => s.resetView);
  const zoom = usePatternStore((s) => s.zoom);
  const setZoom = usePatternStore((s) => s.setZoom);

  // Preset state
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Filter presets by pattern type
  const filteredPresets = builtInPresets.filter((p) => {
    const presetType = (p as any).patternType || 'rings';
    return presetType === patternType;
  });

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = builtInPresets.find((p) => p.id === presetId);
      if (preset) {
        const presetType = (preset as any).patternType || 'rings';
        setPatternType(presetType as PatternType);

        switch (presetType) {
          case 'rings':
            setRingConfig(preset.config as RingPatternConfig);
            break;
          case 'squares':
            setSquareConfig(preset.config as unknown as SquarePatternConfig);
            break;
          case 'polygons':
            setPolygonConfig(preset.config as unknown as PolygonPatternConfig);
            break;
          case 'spirals':
            setSpiralConfig(preset.config as unknown as SpiralPatternConfig);
            break;
        }
        setSelectedPreset(presetId);
      }
    },
    [setPatternType, setRingConfig, setSquareConfig, setPolygonConfig, setSpiralConfig]
  );

  const handleExport = useCallback(() => {
    let paths: SVGPath[] = [];
    let canvasSize = 720;

    switch (patternType) {
      case 'rings': {
        const pattern = generateRingPattern(ringConfig);
        canvasSize = ringConfig.outerRadius * 2;
        if (pattern.outerBoundary) {
          paths.push({ d: pattern.outerBoundary, stroke: '#FF0000' });
        }
        for (const ring of pattern.rings) {
          paths.push({ d: ring.pathData, stroke: '#FF0000' });
        }
        break;
      }
      case 'squares': {
        const pattern = generateSquarePattern(squareConfig);
        canvasSize = squareConfig.outerSize * 2;
        if (pattern.outerBoundary) {
          paths.push({ d: pattern.outerBoundary, stroke: '#FF0000' });
        }
        for (const sq of pattern.squares) {
          paths.push({ d: sq.pathData, stroke: '#FF0000' });
        }
        break;
      }
      case 'polygons': {
        const pattern = generatePolygonPattern(polygonConfig);
        canvasSize = polygonConfig.outerRadius * 2;
        if (pattern.outerBoundary) {
          paths.push({ d: pattern.outerBoundary, stroke: '#FF0000' });
        }
        for (const poly of pattern.polygons) {
          paths.push({ d: poly.pathData, stroke: '#FF0000' });
        }
        break;
      }
      case 'spirals': {
        const pattern = generateSpiralPattern(spiralConfig);
        canvasSize = spiralConfig.outerRadius * 2;
        if (pattern.outerBoundary) {
          paths.push({ d: pattern.outerBoundary, stroke: '#FF0000' });
        }
        for (const arm of pattern.arms) {
          paths.push({ d: arm.pathData, stroke: '#FF0000' });
        }
        break;
      }
    }

    const sizeInches = pixelsToInches(canvasSize);
    const svgContent = exportSVG(paths, {
      width: sizeInches,
      height: sizeInches,
      unit: 'inches',
      kerfAllowance,
      strokeColor: '#FF0000',
    });

    // Download
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bauhaus-${patternType}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [patternType, ringConfig, squareConfig, polygonConfig, spiralConfig, kerfAllowance]);

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Bauhaus Patterns</h1>
        <p className="text-sm text-gray-500">Parametric Pattern Generator</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Pattern Type */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Pattern Type
          </h2>
          <Select
            label=""
            value={patternType}
            options={PATTERN_TYPE_OPTIONS}
            onChange={(v) => setPatternType(v as PatternType)}
          />
        </section>

        {/* Presets */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Presets
          </h2>
          <select
            value={selectedPreset}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-bauhaus-blue"
          >
            <option value="">Select a preset...</option>
            {filteredPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </section>

        {/* Pattern-specific controls */}
        {patternType === 'rings' && (
          <RingsControls config={ringConfig} setConfig={setRingConfig} />
        )}
        {patternType === 'squares' && (
          <SquaresControls config={squareConfig} setConfig={setSquareConfig} />
        )}
        {patternType === 'polygons' && (
          <PolygonsControls config={polygonConfig} setConfig={setPolygonConfig} />
        )}
        {patternType === 'spirals' && (
          <SpiralsControls config={spiralConfig} setConfig={setSpiralConfig} />
        )}

        {/* Display */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Display
          </h2>
          <Slider
            label="Zoom"
            value={zoom}
            min={1}
            max={4}
            step={0.1}
            decimals={1}
            onChange={setZoom}
          />
        </section>

        {/* Export */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Export
          </h2>
          <div className="space-y-4">
            <NumberInput
              label="Kerf Allowance"
              value={kerfAllowance}
              min={0}
              max={0.02}
              step={0.001}
              unit='"'
              onChange={setKerfAllowance}
            />
            <button
              onClick={handleExport}
              className="w-full py-2 px-4 bg-bauhaus-blue text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Export SVG
            </button>
          </div>
        </section>

        {/* Reset */}
        <section className="pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={resetConfig}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Pattern
            </button>
            <button
              onClick={resetView}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset View
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Rings Controls
function RingsControls({ config, setConfig }: { config: RingPatternConfig; setConfig: (u: Partial<RingPatternConfig>) => void }) {
  const outerRadiusInches = pixelsToInches(config.outerRadius);
  const outerGapInches = pixelsToInches(config.outerGap);
  const cutWidthInches = pixelsToInches(config.cutWidth);

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Dimensions</h2>
        <div className="space-y-4">
          <Slider label="Outer Radius" value={outerRadiusInches} min={1} max={12} step={0.25} unit='"' decimals={2}
            onChange={(v) => setConfig({ outerRadius: inchesToPixels(v) })} />
          <Slider label="Ring Count" value={config.ringCount} min={1} max={50} step={1}
            onChange={(v) => setConfig({ ringCount: v })} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Spacing</h2>
        <div className="space-y-4">
          <Select label="Mode" value={config.spacingMode} options={RING_SPACING_OPTIONS}
            onChange={(v) => setConfig({ spacingMode: v as SpacingMode })} />
          {config.spacingMode === 'shrinkage' && (
            <>
              <Slider label="Outer Gap" value={outerGapInches} min={0.05} max={1} step={0.01} unit='"' decimals={2}
                onChange={(v) => setConfig({ outerGap: inchesToPixels(v) })} />
              <NumberInput label="Shrinkage" value={config.shrinkage} min={0} max={0.5} step={0.01}
                onChange={(v) => setConfig({ shrinkage: v })} />
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Cuts</h2>
        <div className="space-y-4">
          <Slider label="Cut Count" value={config.cutCount} min={0} max={24} step={1}
            onChange={(v) => setConfig({ cutCount: v })} />
          <Slider label="Grid Divisions" value={config.gridDivisions} min={4} max={48} step={1}
            onChange={(v) => setConfig({ gridDivisions: v })} />
          <Slider label="Stagger Offset" value={config.staggerOffset} min={0} max={Math.floor(config.gridDivisions / 2)} step={1}
            onChange={(v) => setConfig({ staggerOffset: v })} />
          <Slider label="Cut Width" value={cutWidthInches} min={0.01} max={0.5} step={0.01} unit='"' decimals={2}
            onChange={(v) => setConfig({ cutWidth: inchesToPixels(v) })} />
        </div>
      </section>

      <section>
        <Toggle label="Show Outer Boundary" checked={config.showOuterBoundary}
          onChange={(v) => setConfig({ showOuterBoundary: v })} />
      </section>
    </>
  );
}

// Squares Controls
function SquaresControls({ config, setConfig }: { config: SquarePatternConfig; setConfig: (u: Partial<SquarePatternConfig>) => void }) {
  const outerSizeInches = pixelsToInches(config.outerSize);
  const outerGapInches = pixelsToInches(config.outerGap);

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Dimensions</h2>
        <div className="space-y-4">
          <Slider label="Outer Size" value={outerSizeInches} min={1} max={12} step={0.25} unit='"' decimals={2}
            onChange={(v) => setConfig({ outerSize: inchesToPixels(v) })} />
          <Slider label="Square Count" value={config.squareCount} min={1} max={30} step={1}
            onChange={(v) => setConfig({ squareCount: v })} />
          <Slider label="Rotation" value={config.rotation} min={0} max={90} step={5} unit="°"
            onChange={(v) => setConfig({ rotation: v })} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Spacing</h2>
        <div className="space-y-4">
          <Select label="Mode" value={config.spacingMode} options={SQUARE_SPACING_OPTIONS}
            onChange={(v) => setConfig({ spacingMode: v as SquareSpacingMode })} />
          {config.spacingMode === 'shrinkage' && (
            <>
              <Slider label="Outer Gap" value={outerGapInches} min={0.05} max={1} step={0.01} unit='"' decimals={2}
                onChange={(v) => setConfig({ outerGap: inchesToPixels(v) })} />
              <NumberInput label="Shrinkage" value={config.shrinkage} min={0} max={0.5} step={0.01}
                onChange={(v) => setConfig({ shrinkage: v })} />
            </>
          )}
        </div>
      </section>

      <section>
        <Toggle label="Alternating Direction" checked={config.alternating}
          onChange={(v) => setConfig({ alternating: v })} />
        <Toggle label="Show Outer Boundary" checked={config.showOuterBoundary}
          onChange={(v) => setConfig({ showOuterBoundary: v })} />
      </section>
    </>
  );
}

// Polygons Controls
function PolygonsControls({ config, setConfig }: { config: PolygonPatternConfig; setConfig: (u: Partial<PolygonPatternConfig>) => void }) {
  const outerRadiusInches = pixelsToInches(config.outerRadius);
  const outerGapInches = pixelsToInches(config.outerGap);

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Shape</h2>
        <div className="space-y-4">
          <Select label="Sides" value={String(config.sides)} options={POLYGON_SIDES_OPTIONS}
            onChange={(v) => setConfig({ sides: Number(v) as PolygonSides })} />
          <Slider label="Outer Radius" value={outerRadiusInches} min={1} max={12} step={0.25} unit='"' decimals={2}
            onChange={(v) => setConfig({ outerRadius: inchesToPixels(v) })} />
          <Slider label="Polygon Count" value={config.polygonCount} min={1} max={30} step={1}
            onChange={(v) => setConfig({ polygonCount: v })} />
          <Slider label="Rotation" value={config.rotation} min={0} max={90} step={5} unit="°"
            onChange={(v) => setConfig({ rotation: v })} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Spacing</h2>
        <div className="space-y-4">
          <Select label="Mode" value={config.spacingMode} options={SQUARE_SPACING_OPTIONS}
            onChange={(v) => setConfig({ spacingMode: v as PolygonSpacingMode })} />
          {config.spacingMode === 'shrinkage' && (
            <>
              <Slider label="Outer Gap" value={outerGapInches} min={0.05} max={1} step={0.01} unit='"' decimals={2}
                onChange={(v) => setConfig({ outerGap: inchesToPixels(v) })} />
              <NumberInput label="Shrinkage" value={config.shrinkage} min={0} max={0.5} step={0.01}
                onChange={(v) => setConfig({ shrinkage: v })} />
            </>
          )}
        </div>
      </section>

      <section>
        <Toggle label="Show Outer Boundary" checked={config.showOuterBoundary}
          onChange={(v) => setConfig({ showOuterBoundary: v })} />
      </section>
    </>
  );
}

// Spirals Controls
function SpiralsControls({ config, setConfig }: { config: SpiralPatternConfig; setConfig: (u: Partial<SpiralPatternConfig>) => void }) {
  const outerRadiusInches = pixelsToInches(config.outerRadius);
  const innerRadiusInches = pixelsToInches(config.innerRadius);

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Spiral</h2>
        <div className="space-y-4">
          <Slider label="Arm Count" value={config.armCount} min={2} max={24} step={1}
            onChange={(v) => setConfig({ armCount: v })} />
          <Select label="Spiral Type" value={config.spiralType} options={SPIRAL_TYPE_OPTIONS}
            onChange={(v) => setConfig({ spiralType: v as SpiralType })} />
          <Slider label="Turns" value={config.turns} min={0.5} max={6} step={0.25}
            onChange={(v) => setConfig({ turns: v })} />
          {config.spiralType === 'logarithmic' && (
            <Slider label="Growth Factor" value={config.growthFactor} min={0.05} max={0.5} step={0.01}
              onChange={(v) => setConfig({ growthFactor: v })} />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Dimensions</h2>
        <div className="space-y-4">
          <Slider label="Outer Radius" value={outerRadiusInches} min={1} max={12} step={0.25} unit='"' decimals={2}
            onChange={(v) => setConfig({ outerRadius: inchesToPixels(v) })} />
          <Slider label="Inner Radius" value={innerRadiusInches} min={0.05} max={2} step={0.05} unit='"' decimals={2}
            onChange={(v) => setConfig({ innerRadius: inchesToPixels(v) })} />
          <Slider label="Rotation" value={config.rotation} min={0} max={360} step={15} unit="°"
            onChange={(v) => setConfig({ rotation: v })} />
        </div>
      </section>

      <section>
        <Toggle label="Show Outer Boundary" checked={config.showOuterBoundary}
          onChange={(v) => setConfig({ showOuterBoundary: v })} />
      </section>
    </>
  );
}
