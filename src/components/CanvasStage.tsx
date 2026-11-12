import React, { useEffect, useRef, useState } from 'react';
import {
  EnergySnapshot,
  ModuleId,
  SimulationParams,
  TimeSeriesPoint,
} from '../types/physics';
import { TranslationDict } from '../i18n/translations';
import { Module1HitGeometry, renderModule1 } from '../canvas/renderModule1';
import { Module2HitGeometry, renderModule2 } from '../canvas/renderModule2';
import { Module3HitGeometry, renderModule3 } from '../canvas/renderModule3';

interface CanvasStageProps {
  activeModule: ModuleId;
  params: SimulationParams;
  snapshot: EnergySnapshot;
  series: TimeSeriesPoint[];
  tMax: number;
  isPlaying: boolean;
  isDragging: boolean;
  t: TranslationDict;
  onDragStart: () => void;
  onDragX: (x: number) => void;
  onDragTime: (timeSec: number) => void;
  onDragEnd: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  activeModule,
  params,
  snapshot,
  series,
  tMax,
  isPlaying,
  isDragging,
  t,
  onDragStart,
  onDragX,
  onDragTime,
  onDragEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 720, height: 560 });

  const geom1Ref = useRef<Module1HitGeometry | null>(null);
  const geom2Ref = useRef<Module2HitGeometry | null>(null);
  const geom3Ref = useRef<Module3HitGeometry | null>(null);
  const activeDragRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(320, Math.floor(entry.contentRect.width));
        const h = Math.max(460, Math.min(620, Math.floor(w * 0.72)));
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.floor(size.width * dpr);
    const targetH = Math.floor(size.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    if (activeModule === 'tanks') {
      geom1Ref.current = renderModule1(
        ctx,
        size.width,
        size.height,
        params,
        snapshot,
        t,
        isDragging,
        snapshot.t
      );
    } else if (activeModule === 'ex-graph') {
      geom2Ref.current = renderModule2(
        ctx,
        size.width,
        size.height,
        params,
        snapshot,
        t
      );
    } else {
      geom3Ref.current = renderModule3(
        ctx,
        size.width,
        size.height,
        params,
        series,
        snapshot,
        tMax,
        t
      );
    }

    ctx.restore();
  }, [activeModule, params, snapshot, series, tMax, size, isDragging, t]);

  const getLocalCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      px: e.clientX - rect.left,
      py: e.clientY - rect.top,
    };
  };

  const applyPointerInteraction = (px: number) => {
    if (activeModule === 'tanks' && geom1Ref.current) {
      const { eqX, pxPerMeter } = geom1Ref.current;
      const newX = Math.max(-params.A, Math.min(params.A, (px - eqX) / pxPerMeter));
      onDragX(newX);
    } else if (activeModule === 'ex-graph' && geom2Ref.current) {
      const { plotLeft, plotRight } = geom2Ref.current;
      const frac = Math.max(0, Math.min(1, (px - plotLeft) / Math.max(1, plotRight - plotLeft)));
      const newX = -params.A + frac * (2 * params.A);
      onDragX(newX);
    } else if (activeModule === 'et-graph' && geom3Ref.current) {
      const { plotLeft, plotRight, tMax: spanT } = geom3Ref.current;
      const frac = Math.max(0, Math.min(1, (px - plotLeft) / Math.max(1, plotRight - plotLeft)));
      onDragTime(frac * spanT);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { px, py } = getLocalCoords(e);

    if (activeModule === 'tanks') {
      const g = geom1Ref.current;
      if (!g) return;
      const inOscillatorZone = py <= size.height * 0.46;
      const nearBlock =
        px >= g.blockX - 24 &&
        px <= g.blockX + g.blockW + 24 &&
        py >= g.blockY - 24 &&
        py <= g.blockY + g.blockH + 24;
      if (!inOscillatorZone && !nearBlock) return;
    }

    activeDragRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart();
    applyPointerInteraction(px);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeDragRef.current) return;
    const { px } = getLocalCoords(e);
    applyPointerInteraction(px);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeDragRef.current) return;
    activeDragRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onDragEnd();
  };

  const statusText = isDragging
    ? `✋ ${t.canvas.dragging}`
    : isPlaying
      ? `● ${t.canvas.running}`
      : `❚❚ ${t.canvas.paused}`;

  const statusClass = isDragging
    ? 'text-emerald-700'
    : isPlaying
      ? 'text-emerald-700'
      : 'text-amber-700';

  const isDamped = activeModule === 'et-graph' && params.dampingEnabled && params.b > 0.0001;

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-3">
      {/* Stage Header Card */}
      <div className="bg-white/95 border border-sky-200 rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-950 truncate">
            {t.tabs[activeModule].full}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
            {t.tabs[activeModule].goal}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold shrink-0">
          <span className={statusClass}>{statusText}</span>
        </div>
      </div>

      {/* Main High-DPI Canvas Card */}
      <div
        ref={containerRef}
        className="bg-white/95 border border-sky-200 rounded-2xl p-3 shadow-sm flex flex-col gap-2.5"
      >
        <div className="relative w-full overflow-hidden rounded-xl border border-sky-100 bg-sky-50/40">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`block w-full touch-none select-none ${
              activeModule === 'tanks'
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-crosshair'
            }`}
          />
        </div>

        {/* Clean Unboxed Canvas Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] font-semibold text-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-xs bg-emerald-600 inline-block" />
              <span>{t.telemetry.kineticEnergy}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-xs bg-sky-600 inline-block" />
              <span>{t.telemetry.potentialEnergy}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-xs bg-slate-900 inline-block" />
              <span>{t.telemetry.totalEnergy}</span>
            </span>
            {isDamped && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-xs bg-rose-600 inline-block" />
                <span>{t.canvas.lossLabel}</span>
              </span>
            )}
          </div>

          <span className="font-mono tabular-nums text-slate-500">
            E = ½kA² = {snapshot.eTotal.toFixed(2)} J
          </span>
        </div>
      </div>
    </main>
  );
};
