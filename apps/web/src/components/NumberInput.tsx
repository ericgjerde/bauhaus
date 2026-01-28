import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
}: NumberInputProps) {
  // Handle NaN/undefined values
  const safeValue = Number.isFinite(value) ? value : min ?? 0;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={safeValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-bauhaus-blue focus:border-bauhaus-blue"
        />
        {unit && <span className="ml-2 text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
