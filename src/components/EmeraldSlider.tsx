import React from 'react';

interface EmeraldSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimals?: number;
  note?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const EmeraldSlider: React.FC<EmeraldSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 1,
  note,
  disabled = false,
  onChange,
}) => {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-800 leading-tight"
        >
          {label}
        </label>
        <div className="font-mono tabular-nums text-xs font-bold text-emerald-700 whitespace-nowrap shrink-0">
          {clamped.toFixed(decimals)}
          <span className="text-[11px] font-medium text-slate-500 ml-1">{unit}</span>
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          className="w-full h-2 rounded-full overflow-hidden pointer-events-none border border-emerald-200/80"
        >
          <rect x="0" y="0" width="100" height="8" fill="#d1fae5" />
          <rect x="0" y="0" width={Math.max(0, Math.min(100, pct))} height="8" fill="#059669" />
        </svg>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="emerald-range-input absolute inset-0 w-full h-full m-0"
        />
      </div>

      {note && (
        <p className="text-[11px] text-slate-500 leading-snug">{note}</p>
      )}
    </div>
  );
};
