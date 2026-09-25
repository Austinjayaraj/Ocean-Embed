export interface OceanLocation {
  lat: number;
  lng: number;
  name: string;
  region: 'Arabian Sea' | 'Bay of Bengal' | 'North Indian Ocean';
}

export interface OceanObservation {
  location: OceanLocation;
  date: string;
  sst: number;
  sss: number;
  sla: number;
  uCurrent: number;
  vCurrent: number;
  uWind: number;
  vWind: number;
  currentSpeed: number;
  windSpeed: number;
}

export interface DepthTemperature {
  depth: number;
  predicted: number;
  argoReference: number | null;
  difference: number | null;
  uncertainty: number;
}

export interface TemperatureProfile {
  location: OceanLocation;
  date: string;
  depths: DepthTemperature[];
}

export interface ArgoObservation {
  id: string;
  location: OceanLocation;
  date: string;
  depths: DepthTemperature[];
}

export interface Anomaly {
  id: string;
  location: OceanLocation;
  depthRangeMin: number;
  depthRangeMax: number;
  anomalyValue: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Marine Heatwave';
  description: string;
  detectedDate: string;
}

export interface PipelineStep {
  id: number;
  name: string;
  status: 'operational' | 'warning' | 'error' | 'pending';
  lastRun: string;
  duration: string;
  description: string;
}

export interface DataSource {
  dataset: string;
  source: string;
  status: 'Available' | 'Delayed' | 'Unavailable';
  lastUpdate: string;
  records: string;
  description: string;
}

export interface SystemHealth {
  service: string;
  status: 'Operational' | 'Degraded' | 'Down';
  uptime: string;
  lastCheck: string;
  details: string;
}

export interface ValidationMetrics {
  rmse: number;
  bias: number;
  correlation: number;
  validatedProfiles: number;
}

export interface ValidationEntry {
  id: string;
  location: OceanLocation;
  depth: number;
  predicted: number;
  argoValue: number;
  error: number;
  date: string;
}

export type OceanVariable =
  | 'SST'
  | 'SSS'
  | 'SLA'
  | 'U Current'
  | 'V Current'
  | 'Wind U'
  | 'Wind V'
  | 'Predicted Temperature'
  | 'Uncertainty'
  | 'Anomaly';

export type Region = 'North Indian Ocean' | 'Arabian Sea' | 'Bay of Bengal';
