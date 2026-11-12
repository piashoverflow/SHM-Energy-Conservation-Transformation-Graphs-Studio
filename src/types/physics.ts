export type ModuleId = 'tanks' | 'ex-graph' | 'et-graph';
export type Language = 'bn' | 'en';

export interface SimulationParams {
  k: number; // Spring constant (N/m)
  m: number; // Mass (kg)
  A: number; // Amplitude (m)
  deltaDeg: number; // Initial phase in degrees
  dampingEnabled: boolean;
  b: number; // Damping coefficient (N·s/m)
  speed: number; // Playback speed multiplier
  timeWindowPeriods: number; // 1 | 2 | 3 | 4
}

export type LandmarkKind =
  | 'equilibrium'
  | 'half-amplitude'
  | 'equal-energy'
  | 'extreme'
  | null;

export interface EnergySnapshot {
  t: number;
  x: number;
  v: number;
  ek: number;
  ep: number;
  eMech: number;
  eTotal: number;
  eLoss: number;
  omega0: number;
  period: number;
  frequency: number;
  ekPct: number;
  epPct: number;
  eLossPct: number;
  landmark: LandmarkKind;
}

export interface TimeSeriesPoint {
  t: number;
  x: number;
  v: number;
  ek: number;
  ep: number;
  eMech: number;
  eLoss: number;
  envelope: number;
}
