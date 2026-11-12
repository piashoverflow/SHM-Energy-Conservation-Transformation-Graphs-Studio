import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { translations } from './i18n/translations';
import {
  computeSnapshotAtPosition,
  computeUndampedState,
  generateTimeSeries,
  sampleSeriesAtTime,
} from './physics/shmEngine';
import { Language, ModuleId, SimulationParams } from './types/physics';
import { TopNavBar } from './components/TopNavBar';
import { LeftControlDock } from './components/LeftControlDock';
import { CanvasStage } from './components/CanvasStage';
import { RightTelemetryPanel } from './components/RightTelemetryPanel';

const DEFAULT_PARAMS: SimulationParams = {
  k: 50,
  m: 2.0,
  A: 1.0,
  deltaDeg: 0,
  dampingEnabled: false,
  b: 0.5,
  speed: 1,
  timeWindowPeriods: 1,
};

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('tanks');
  const [language, setLanguage] = useState<Language>('bn');
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);

  // Manual static position override while dragging or scrubbing when paused
  const [manualX, setManualX] = useState<number | null>(null);
  const wasPlayingBeforeDragRef = useRef<boolean>(true);

  const t = translations[language];

  const omega0 = Math.sqrt(params.k / params.m);
  const period = (2 * Math.PI) / omega0;
  const tMax = Math.max(0.5, params.timeWindowPeriods * period);

  // Precompute time-series only for Module 3 (instantaneous <0.1ms for 420 pts)
  const module3Series = useMemo(() => {
    if (activeModule !== 'et-graph') return [];
    return generateTimeSeries(params, tMax, 420);
  }, [activeModule, params, tMax]);

  // 60 FPS Animation Loop
  useEffect(() => {
    if (!isPlaying || isDragging) return;

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dtReal = Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
      lastTs = now;
      const dtSim = dtReal * params.speed;

      setManualX(null);
      setSimTime((prev) => {
        const next = prev + dtSim;
        if (activeModule === 'et-graph') {
          return next >= tMax ? next % tMax : next;
        }
        return next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, isDragging, params.speed, activeModule, tMax]);

  // Keep simTime within tMax when switching to Module 3 or changing timeWindow
  useEffect(() => {
    if (activeModule === 'et-graph') {
      setSimTime((prev) => (prev > tMax ? prev % tMax : prev));
    }
  }, [activeModule, tMax]);

  const snapshot = useMemo(() => {
    if (activeModule === 'et-graph') {
      return sampleSeriesAtTime(module3Series, simTime, params);
    }
    if (manualX !== null) {
      return computeSnapshotAtPosition(manualX, simTime, params, 1);
    }
    return computeUndampedState(simTime, params);
  }, [activeModule, module3Series, simTime, params, manualX]);

  const handleChangeParams = useCallback(
    (patch: Partial<SimulationParams>) => {
      setParams((prev) => {
        const next = { ...prev, ...patch };
        if (manualX !== null && Math.abs(manualX) > next.A) {
          setManualX(Math.sign(manualX) * next.A);
        }
        return next;
      });
    },
    [manualX]
  );

  // Align simTime phase so oscillation seamlessly resumes from scrubbed position x
  const alignTimeToPosition = useCallback(
    (xVal: number) => {
      const clamped = Math.max(-params.A, Math.min(params.A, xVal));
      const ratio = params.A > 0 ? Math.max(-1, Math.min(1, clamped / params.A)) : 0;
      const targetPhase = Math.asin(ratio);
      const deltaRad = (params.deltaDeg * Math.PI) / 180;
      let newT = (targetPhase - deltaRad) / omega0;
      while (newT < 0) newT += period;
      setSimTime(newT);
    },
    [params.A, params.deltaDeg, omega0, period]
  );

  const handleScrubX = useCallback(
    (newX: number) => {
      setIsPlaying(false);
      setManualX(newX);
      alignTimeToPosition(newX);
    },
    [alignTimeToPosition]
  );

  const handleDragStart = useCallback(() => {
    wasPlayingBeforeDragRef.current = isPlaying;
    setIsDragging(true);
    setIsPlaying(false);
  }, [isPlaying]);

  const handleDragX = useCallback(
    (newX: number) => {
      setManualX(newX);
      alignTimeToPosition(newX);
    },
    [alignTimeToPosition]
  );

  const handleDragTime = useCallback((timeSec: number) => {
    setManualX(null);
    setSimTime(timeSec);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (activeModule === 'tanks' && wasPlayingBeforeDragRef.current) {
      setManualX(null);
      setIsPlaying(true);
    }
  }, [activeModule]);

  const handleTogglePlay = useCallback(() => {
    setManualX(null);
    setIsPlaying((prev) => !prev);
  }, []);

  const handleStep = useCallback(() => {
    setIsPlaying(false);
    setManualX(null);
    const stepDt = period / 24;
    setSimTime((prev) => {
      const next = prev + stepDt;
      return activeModule === 'et-graph' ? next % tMax : next;
    });
  }, [period, activeModule, tMax]);

  const handleResetPhase = useCallback(() => {
    setManualX(null);
    setSimTime(0);
  }, []);

  const handleResetAll = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setManualX(null);
    setSimTime(0);
    setIsPlaying(true);
    setIsDragging(false);
  }, []);

  const handleSelectModule = useCallback((id: ModuleId) => {
    setActiveModule(id);
    setManualX(null);
    if (id === 'et-graph') {
      setSimTime(0);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-950">
      <TopNavBar
        activeModule={activeModule}
        language={language}
        t={t}
        onSelectModule={handleSelectModule}
        onToggleLanguage={setLanguage}
        onResetAll={handleResetAll}
      />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-start gap-4">
        <LeftControlDock
          activeModule={activeModule}
          params={params}
          isPlaying={isPlaying}
          currentX={snapshot.x}
          t={t}
          onTogglePlay={handleTogglePlay}
          onStep={handleStep}
          onResetPhase={handleResetPhase}
          onChangeParams={handleChangeParams}
          onScrubX={handleScrubX}
        />

        <CanvasStage
          activeModule={activeModule}
          params={params}
          snapshot={snapshot}
          series={module3Series}
          tMax={tMax}
          isPlaying={isPlaying}
          isDragging={isDragging}
          t={t}
          onDragStart={handleDragStart}
          onDragX={handleDragX}
          onDragTime={handleDragTime}
          onDragEnd={handleDragEnd}
        />

        <RightTelemetryPanel
          activeModule={activeModule}
          params={params}
          snapshot={snapshot}
          t={t}
        />
      </div>
    </div>
  );
}
