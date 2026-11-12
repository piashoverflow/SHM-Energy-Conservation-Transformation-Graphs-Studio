import {
  EnergySnapshot,
  LandmarkKind,
  SimulationParams,
  TimeSeriesPoint,
} from '../types/physics';

export function detectLandmark(x: number, A: number): LandmarkKind {
  if (A <= 0) return null;
  const ratio = Math.abs(x) / A;
  if (ratio < 0.03) return 'equilibrium';
  if (Math.abs(ratio - 0.5) < 0.03) return 'half-amplitude';
  if (Math.abs(ratio - Math.SQRT1_2) < 0.03) return 'equal-energy';
  if (ratio > 0.97) return 'extreme';
  return null;
}

export function computeUndampedState(
  t: number,
  params: SimulationParams
): EnergySnapshot {
  const { k, m, A, deltaDeg } = params;
  const omega0 = Math.sqrt(k / m);
  const period = (2 * Math.PI) / omega0;
  const frequency = 1 / period;
  const delta = (deltaDeg * Math.PI) / 180;

  const phase = omega0 * t + delta;
  const x = A * Math.sin(phase);
  const v = omega0 * A * Math.cos(phase);

  const eTotal = 0.5 * k * A * A;
  const ep = 0.5 * k * x * x;
  const ek = Math.max(0, eTotal - ep);

  return {
    t,
    x,
    v,
    ek,
    ep,
    eMech: eTotal,
    eTotal,
    eLoss: 0,
    omega0,
    period,
    frequency,
    ekPct: eTotal > 0 ? (ek / eTotal) * 100 : 0,
    epPct: eTotal > 0 ? (ep / eTotal) * 100 : 0,
    eLossPct: 0,
    landmark: detectLandmark(x, A),
  };
}

export function computeSnapshotAtPosition(
  xRaw: number,
  t: number,
  params: SimulationParams,
  directionSign = 1
): EnergySnapshot {
  const { k, m, A } = params;
  const x = Math.max(-A, Math.min(A, xRaw));
  const omega0 = Math.sqrt(k / m);
  const period = (2 * Math.PI) / omega0;
  const frequency = 1 / period;

  const eTotal = 0.5 * k * A * A;
  const ep = 0.5 * k * x * x;
  const ek = Math.max(0, eTotal - ep);
  const vMag = omega0 * Math.sqrt(Math.max(0, A * A - x * x));
  const v = directionSign * vMag;

  return {
    t,
    x,
    v,
    ek,
    ep,
    eMech: eTotal,
    eTotal,
    eLoss: 0,
    omega0,
    period,
    frequency,
    ekPct: eTotal > 0 ? (ek / eTotal) * 100 : 0,
    epPct: eTotal > 0 ? (ep / eTotal) * 100 : 0,
    eLossPct: 0,
    landmark: detectLandmark(x, A),
  };
}

/**
 * Generates exact time-series for Module 3 using analytical equations (undamped)
 * or high-precision RK4 ODE integration (damped: m*x'' + b*x' + k*x = 0)
 * starting from exact initial energy E0 = 0.5 * k * A^2.
 */
export function generateTimeSeries(
  params: SimulationParams,
  tMax: number,
  sampleCount = 420
): TimeSeriesPoint[] {
  const { k, m, A, deltaDeg, dampingEnabled, b } = params;
  const omega0 = Math.sqrt(k / m);
  const delta = (deltaDeg * Math.PI) / 180;
  const e0 = 0.5 * k * A * A;
  const dt = tMax / (sampleCount - 1);

  const points: TimeSeriesPoint[] = [];

  if (!dampingEnabled || b <= 0.0001) {
    for (let i = 0; i < sampleCount; i++) {
      const t = i * dt;
      const phase = omega0 * t + delta;
      const x = A * Math.sin(phase);
      const v = omega0 * A * Math.cos(phase);
      const ep = 0.5 * k * x * x;
      const ek = 0.5 * m * v * v;
      points.push({
        t,
        x,
        v,
        ek,
        ep,
        eMech: e0,
        eLoss: 0,
        envelope: A,
      });
    }
    return points;
  }

  // RK4 integration with fine substeps for rock-solid energy conservation
  const substeps = 4;
  const h = dt / substeps;
  let x = A * Math.sin(delta);
  let v = omega0 * A * Math.cos(delta);
  const gamma = b / (2 * m);

  const accel = (pos: number, vel: number) => (-k * pos - b * vel) / m;

  for (let i = 0; i < sampleCount; i++) {
    const t = i * dt;
    const ep = 0.5 * k * x * x;
    const ek = 0.5 * m * v * v;
    const eMech = Math.min(e0, ep + ek);
    const eLoss = Math.max(0, e0 - eMech);

    points.push({
      t,
      x,
      v,
      ek,
      ep,
      eMech,
      eLoss,
      envelope: A * Math.exp(-gamma * t),
    });

    if (i < sampleCount - 1) {
      for (let s = 0; s < substeps; s++) {
        const k1x = v;
        const k1v = accel(x, v);

        const k2x = v + 0.5 * h * k1v;
        const k2v = accel(x + 0.5 * h * k1x, v + 0.5 * h * k1v);

        const k3x = v + 0.5 * h * k2v;
        const k3v = accel(x + 0.5 * h * k2x, v + 0.5 * h * k2v);

        const k4x = v + h * k3v;
        const k4v = accel(x + h * k3x, v + h * k3v);

        x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      }
    }
  }

  return points;
}

export function sampleSeriesAtTime(
  series: TimeSeriesPoint[],
  t: number,
  params: SimulationParams
): EnergySnapshot {
  const { k, m, A } = params;
  const omega0 = Math.sqrt(k / m);
  const period = (2 * Math.PI) / omega0;
  const frequency = 1 / period;
  const eTotal = 0.5 * k * A * A;

  if (series.length === 0) {
    return computeUndampedState(t, params);
  }

  const tMax = series[series.length - 1].t;
  const clampedT = Math.max(0, Math.min(tMax, t));
  const frac = tMax > 0 ? (clampedT / tMax) * (series.length - 1) : 0;
  const idx0 = Math.min(series.length - 1, Math.floor(frac));
  const idx1 = Math.min(series.length - 1, idx0 + 1);
  const alpha = frac - idx0;

  const p0 = series[idx0];
  const p1 = series[idx1];

  const x = p0.x + (p1.x - p0.x) * alpha;
  const v = p0.v + (p1.v - p0.v) * alpha;
  const ep = 0.5 * k * x * x;
  const ek = 0.5 * m * v * v;
  const eMech = Math.min(eTotal, ep + ek);
  const eLoss = Math.max(0, eTotal - eMech);

  return {
    t: clampedT,
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
    ekPct: eTotal > 0 ? (ek / eTotal) * 100 : 0,
    epPct: eTotal > 0 ? (ep / eTotal) * 100 : 0,
    eLossPct: eTotal > 0 ? (eLoss / eTotal) * 100 : 0,
    landmark: detectLandmark(x, A),
  };
}
