import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  decimals?: number;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  decimals = 0,
}: SliderProps) {
  // Handle NaN/undefined values
  const safeValue = Number.isFinite(value) ? value : min;
  const displayValue = decimals > 0 ? safeValue.toFixed(decimals) : safeValue;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <label className="font-medium text-gray-700">{label}</label>
        <span className="text-gray-500 tabular-nums">
          {displayValue}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
