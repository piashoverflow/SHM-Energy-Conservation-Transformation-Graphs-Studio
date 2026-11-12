import React from 'react';
import { EnergySnapshot, ModuleId, SimulationParams } from '../types/physics';
import { TranslationDict } from '../i18n/translations';

interface RightTelemetryPanelProps {
  activeModule: ModuleId;
  params: SimulationParams;
  snapshot: EnergySnapshot;
  t: TranslationDict;
}

export const RightTelemetryPanel: React.FC<RightTelemetryPanelProps> = ({
  activeModule,
  params,
  snapshot,
  t,
}) => {
  const { k, m, A, dampingEnabled, b } = params;
  const {
    x,
    v,
    ek,
    ep,
    eMech,
    eTotal,
    eLoss,
    omega0,
    period,
    frequency,
    ekPct,
    epPct,
    eLossPct,
    landmark,
  } = snapshot;

  const isDampedMode = activeModule === 'et-graph' && dampingEnabled && b > 0.0001;

  const landmarkInfo = (() => {
    switch (landmark) {
      case 'equilibrium':
        return {
          title: t.telemetry.landmarks.equilibriumTitle,
          desc: t.telemetry.landmarks.equilibriumDesc,
          tone: 'bg-emerald-50 border-emerald-400 text-emerald-950',
          badge: 'x = 0',
        };
      case 'half-amplitude':
        return {
          title: t.telemetry.landmarks.halfTitle,
          desc: t.telemetry.landmarks.halfDesc,
          tone: 'bg-sky-50 border-sky-400 text-sky-950',
          badge: 'x = ±A/2',
        };
      case 'equal-energy':
        return {
          title: t.telemetry.landmarks.equalTitle,
          desc: t.telemetry.landmarks.equalDesc,
          tone: 'bg-amber-50 border-amber-400 text-amber-950',
          badge: 'x = ±A/√2',
        };
      case 'extreme':
        return {
          title: t.telemetry.landmarks.extremeTitle,
          desc: t.telemetry.landmarks.extremeDesc,
          tone: 'bg-sky-100 border-sky-500 text-slate-950',
          badge: 'x = ±A',
        };
      default:
        return {
          title: t.telemetry.landmarks.noneTitle,
          desc: t.telemetry.landmarks.noneDesc,
          tone: 'bg-slate-50 border-slate-200 text-slate-800',
          badge: `${((Math.abs(x) / A) * 100).toFixed(0)}% A`,
        };
    }
  })();

  const epFrac = eTotal > 0 ? ep / eTotal : 0;
  const ekFrac = eTotal > 0 ? ek / eTotal : 0;

  return (
    <aside className="w-full lg:w-[330px] shrink-0 flex flex-col gap-4">
      {/* Live Energy Breakdown Card */}
      <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {t.telemetry.header}
          </h2>
          <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-500">
            t = {snapshot.t.toFixed(2)} s
          </span>
        </div>

        {/* Energy Value Gauges */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Kinetic Energy */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-emerald-900">
                {t.telemetry.kineticEnergy}
              </div>
              <div className="font-mono tabular-nums text-[11px] text-emerald-700 font-semibold">
                {ekPct.toFixed(1)}%
              </div>
            </div>
            <div className="font-mono tabular-nums text-xl font-extrabold text-emerald-700">
              {ek.toFixed(2)}
              <span className="text-xs font-semibold text-emerald-600 ml-1">J</span>
            </div>
          </div>

          {/* Potential Energy */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-sky-900">
                {t.telemetry.potentialEnergy}
              </div>
              <div className="font-mono tabular-nums text-[11px] text-sky-700 font-semibold">
                {epPct.toFixed(1)}%
              </div>
            </div>
            <div className="font-mono tabular-nums text-xl font-extrabold text-sky-700">
              {ep.toFixed(2)}
              <span className="text-xs font-semibold text-sky-600 ml-1">J</span>
            </div>
          </div>

          {/* Thermal Loss (only in damped mode) */}
          {isDampedMode && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-rose-900">
                  {t.telemetry.thermalLoss}
                </div>
                <div className="font-mono tabular-nums text-[11px] text-rose-700 font-semibold">
                  {eLossPct.toFixed(1)}%
                </div>
              </div>
              <div className="font-mono tabular-nums text-xl font-extrabold text-rose-600">
                {eLoss.toFixed(2)}
                <span className="text-xs font-semibold text-rose-500 ml-1">J</span>
              </div>
            </div>
          )}

          {/* Total Energy */}
          <div className="rounded-xl border border-slate-200 bg-slate-950 text-white px-3 py-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-200">
                {isDampedMode ? `${t.telemetry.mechEnergy} / E₀` : t.telemetry.totalEnergy}
              </div>
              <div className="font-mono tabular-nums text-[11px] text-amber-300 font-semibold">
                {isDampedMode
                  ? `${eMech.toFixed(2)} J + ${eLoss.toFixed(2)} J`
                  : '100.0% Conserved'}
              </div>
            </div>
            <div className="font-mono tabular-nums text-xl font-extrabold text-white">
              {eTotal.toFixed(2)}
              <span className="text-xs font-semibold text-slate-300 ml-1">J</span>
            </div>
          </div>
        </div>

        {/* Stacked Percentage Split Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>{t.telemetry.energySplit}</span>
            <span className="font-mono tabular-nums">
              {ekPct.toFixed(0)}% / {epPct.toFixed(0)}%
              {isDampedMode ? ` / ${eLossPct.toFixed(0)}%` : ''}
            </span>
          </div>
          <svg
            aria-label={t.telemetry.energySplit}
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="w-full h-3 rounded-full overflow-hidden border border-sky-200 bg-slate-100"
          >
            <rect x="0" y="0" width={ekPct} height="10" fill="#059669" />
            <rect x={ekPct} y="0" width={epPct} height="10" fill="#0284c7" />
            {isDampedMode && (
              <rect
                x={ekPct + epPct}
                y="0"
                width={Math.max(0, 100 - ekPct - epPct)}
                height="10"
                fill="#e11d48"
              />
            )}
          </svg>
        </div>
      </section>

      {/* Landmark Detector / Module Ratios Card */}
      <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {t.telemetry.landmarkHeader}
          </h2>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {landmarkInfo.badge}
          </span>
        </div>

        <div className={`rounded-xl border p-3 transition-colors ${landmarkInfo.tone}`}>
          <div className="text-xs font-extrabold">{landmarkInfo.title}</div>
          <p className="text-[11px] mt-1 leading-relaxed opacity-90">{landmarkInfo.desc}</p>
        </div>

        {activeModule === 'ex-graph' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-2.5">
              <div className="text-[11px] font-semibold text-sky-900">
                {t.telemetry.ratioEp}
              </div>
              <div className="font-mono tabular-nums text-sm font-extrabold text-sky-700 mt-0.5">
                {epFrac.toFixed(3)} <span className="text-[11px]">({epPct.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
              <div className="text-[11px] font-semibold text-emerald-900">
                {t.telemetry.ratioEk}
              </div>
              <div className="font-mono tabular-nums text-sm font-extrabold text-emerald-700 mt-0.5">
                {ekFrac.toFixed(3)} <span className="text-[11px]">({ekPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'et-graph' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-2.5">
              <div className="text-[11px] font-semibold text-slate-700">
                {t.telemetry.energyPeriod}
              </div>
              <div className="font-mono tabular-nums text-sm font-extrabold text-sky-700 mt-0.5">
                {(period / 2).toFixed(3)} s
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
              <div className="text-[11px] font-semibold text-slate-700">
                {t.telemetry.energyFreq}
              </div>
              <div className="font-mono tabular-nums text-sm font-extrabold text-emerald-700 mt-0.5">
                {(frequency * 2).toFixed(2)} Hz
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Kinematics & Live Formula Substitution Card */}
      <section className="bg-white/95 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {t.telemetry.formulasHeader}
        </h2>

        <div className="space-y-2 font-mono tabular-nums text-[11px]">
          <div className="rounded-xl bg-sky-50/80 border border-sky-200 px-3 py-2 text-slate-900">
            <div className="font-bold text-sky-800">Ep = ½ · k · x²</div>
            <div className="text-slate-700 mt-0.5">
              = 0.5 × {k.toFixed(0)} × ({x.toFixed(2)})² ={' '}
              <span className="font-bold text-sky-700">{ep.toFixed(2)} J</span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 px-3 py-2 text-slate-900">
            <div className="font-bold text-emerald-800">Ek = ½ · m · v²</div>
            <div className="text-slate-700 mt-0.5">
              = 0.5 × {m.toFixed(1)} × ({v.toFixed(2)})² ={' '}
              <span className="font-bold text-emerald-700">{ek.toFixed(2)} J</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900">
            <div className="font-bold text-slate-800">E₀ = ½ · k · A²</div>
            <div className="text-slate-700 mt-0.5">
              = 0.5 × {k.toFixed(0)} × ({A.toFixed(2)})² ={' '}
              <span className="font-bold text-slate-950">{eTotal.toFixed(2)} J</span>
            </div>
          </div>
        </div>

        {/* Kinematics Compact Grid */}
        <div className="pt-2 border-t border-sky-100 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">{t.telemetry.displacement}:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {x >= 0 ? '+' : ''}
              {x.toFixed(2)} m
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.telemetry.velocity}:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {v >= 0 ? '+' : ''}
              {v.toFixed(2)} m/s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.telemetry.angularFreq}:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {omega0.toFixed(2)} rad/s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t.telemetry.period}:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {period.toFixed(2)} s
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-snug">
          {t.telemetry.independentMassNote}
        </p>
      </section>
    </aside>
  );
};
