import React from 'react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { ModuleId, SimulationParams } from '../types/physics';
import { TranslationDict } from '../i18n/translations';
import { EmeraldSlider } from './EmeraldSlider';

interface LeftControlDockProps {
  activeModule: ModuleId;
  params: SimulationParams;
  isPlaying: boolean;
  currentX: number;
  t: TranslationDict;
  onTogglePlay: () => void;
  onStep: () => void;
  onResetPhase: () => void;
  onChangeParams: (patch: Partial<SimulationParams>) => void;
  onScrubX: (x: number) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2];
const TIME_WINDOW_OPTIONS = [1, 2, 3, 4];

export const LeftControlDock: React.FC<LeftControlDockProps> = ({
  activeModule,
  params,
  isPlaying,
  currentX,
  t,
  onTogglePlay,
  onStep,
  onResetPhase,
  onChangeParams,
  onScrubX,
}) => {
  const { k, m, A, deltaDeg, dampingEnabled, b, speed, timeWindowPeriods } = params;

  const snapPresets = [
    { key: 'eq', label: t.controls.presets.eq, xVal: 0 },
    { key: 'half', label: t.controls.presets.half, xVal: A * 0.5 },
    { key: 'equal', label: t.controls.presets.equal, xVal: A * Math.SQRT1_2 },
    { key: 'extreme', label: t.controls.presets.extreme, xVal: A },
  ];

  return (
    <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
      {/* Playback Controls Card */}
      <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-3.5">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.controls.playbackHeader}
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="truncate">{isPlaying ? t.controls.pause : t.controls.play}</span>
          </button>

          <button
            type="button"
            onClick={onStep}
            className="col-span-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5 text-sky-700" />
            <span className="truncate">{t.controls.step}</span>
          </button>

          <button
            type="button"
            onClick={onResetPhase}
            className="col-span-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-mono">{t.controls.resetPhase}</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-xs font-semibold text-slate-700">{t.controls.speed}</span>
          <div className="flex items-center gap-1 p-0.5 bg-sky-50 border border-sky-200 rounded-lg">
            {SPEED_OPTIONS.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => onChangeParams({ speed: sp })}
                className={`px-2 py-1 rounded-md font-mono tabular-nums text-[11px] font-bold transition-colors cursor-pointer ${
                  speed === sp
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {sp}×
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Physical Parameters Card */}
      <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-4">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.controls.paramsHeader}
        </h2>

        <EmeraldSlider
          id="slider-k"
          label={t.controls.springConstant}
          value={k}
          min={10}
          max={200}
          step={1}
          unit="N/m"
          decimals={0}
          onChange={(val) => onChangeParams({ k: val })}
        />

        <EmeraldSlider
          id="slider-m"
          label={t.controls.mass}
          value={m}
          min={0.5}
          max={10.0}
          step={0.1}
          unit="kg"
          decimals={1}
          note={t.controls.massNote}
          onChange={(val) => onChangeParams({ m: val })}
        />

        <EmeraldSlider
          id="slider-A"
          label={t.controls.amplitude}
          value={A}
          min={0.2}
          max={2.0}
          step={0.05}
          unit="m"
          decimals={2}
          note={t.controls.amplitudeNote}
          onChange={(val) => onChangeParams({ A: val })}
        />
      </section>

      {/* Module-Specific Controls Card */}
      {(activeModule === 'tanks' || activeModule === 'ex-graph') && (
        <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-4">
          <EmeraldSlider
            id="slider-x"
            label={t.controls.positionScrubber}
            value={currentX}
            min={-A}
            max={A}
            step={0.01}
            unit="m"
            decimals={2}
            onChange={onScrubX}
          />

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              {t.controls.snapPresets}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {snapPresets.map((preset) => {
                const isNear = Math.abs(Math.abs(currentX) - Math.abs(preset.xVal)) < A * 0.02;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => onScrubX(preset.xVal)}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-bold text-left leading-tight transition-colors cursor-pointer ${
                      isNear
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-sky-50/70 border-sky-200 text-slate-800 hover:bg-sky-100/70'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-600 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 leading-relaxed">
            {activeModule === 'tanks' ? t.controls.dragHintM1 : t.controls.dragHintM2}
          </p>
        </section>
      )}

      {activeModule === 'et-graph' && (
        <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-4">
          <EmeraldSlider
            id="slider-delta"
            label={t.controls.phaseLabel}
            value={deltaDeg}
            min={0}
            max={360}
            step={5}
            unit="°"
            decimals={0}
            onChange={(val) => onChangeParams({ deltaDeg: val })}
          />

          <div className="pt-2 border-t border-sky-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800">
                {t.controls.dampingToggle}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={dampingEnabled}
                onClick={() => {
                  const nextEnabled = !dampingEnabled;
                  onChangeParams({
                    dampingEnabled: nextEnabled,
                    b: nextEnabled && b === 0 ? 0.5 : b,
                    timeWindowPeriods:
                      nextEnabled && timeWindowPeriods === 1 ? 3 : timeWindowPeriods,
                  });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  dampingEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                    dampingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <EmeraldSlider
              id="slider-b"
              label={t.controls.dampingCoeff}
              value={dampingEnabled ? b : 0}
              min={0}
              max={3.0}
              step={0.05}
              unit="N·s/m"
              decimals={2}
              disabled={!dampingEnabled}
              onChange={(val) => onChangeParams({ b: val })}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-700">
              {t.controls.timeWindow}
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-sky-50 border border-sky-200 rounded-lg">
              {TIME_WINDOW_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChangeParams({ timeWindowPeriods: n })}
                  className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                    timeWindowPeriods === n
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {n}T
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-600 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 leading-relaxed">
            {t.controls.dragHintM3}
          </p>
        </section>
      )}
    </aside>
  );
};
