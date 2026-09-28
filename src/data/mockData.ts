import type {
  OceanLocation,
  OceanObservation,
  TemperatureProfile,
  Anomaly,
  PipelineStep,
  DataSource,
  SystemHealth,
  ValidationMetrics,
  ValidationEntry,
  DepthTemperature,
} from '../types/ocean';

// ─── Locations ───────────────────────────────────────────────
export const locations: OceanLocation[] = [
  { lat: 15.25, lng: 88.75, name: 'Bay of Bengal', region: 'Bay of Bengal' },
  { lat: 12.0, lng: 85.0, name: 'Bay of Bengal – Central', region: 'Bay of Bengal' },
  { lat: 15.0, lng: 82.0, name: 'Bay of Bengal – Northwest', region: 'Bay of Bengal' },
  { lat: 8.0, lng: 88.0, name: 'Bay of Bengal – South', region: 'Bay of Bengal' },
  { lat: 13.0, lng: 80.5, name: 'Bay of Bengal – Chennai Coast', region: 'Bay of Bengal' },
  { lat: 18.0, lng: 66.0, name: 'Arabian Sea – Central', region: 'Arabian Sea' },
  { lat: 15.0, lng: 68.0, name: 'Arabian Sea – Eastern', region: 'Arabian Sea' },
  { lat: 20.0, lng: 64.0, name: 'Arabian Sea – Northwest', region: 'Arabian Sea' },
  { lat: 10.0, lng: 72.0, name: 'Lakshadweep Sea', region: 'Arabian Sea' },
  { lat: 5.0, lng: 75.0, name: 'Indian Ocean – Equatorial', region: 'North Indian Ocean' },
  { lat: 6.5, lng: 81.5, name: 'Sri Lanka Basin', region: 'North Indian Ocean' },
  { lat: -2.0, lng: 78.0, name: 'Indian Ocean – Southern', region: 'North Indian Ocean' },
];

export const argoLocations: OceanLocation[] = [
  { lat: 11.5, lng: 84.5, name: 'ARGO Float 2901234', region: 'Bay of Bengal' },
  { lat: 14.2, lng: 83.1, name: 'ARGO Float 2901456', region: 'Bay of Bengal' },
  { lat: 17.5, lng: 67.0, name: 'ARGO Float 2901789', region: 'Arabian Sea' },
  { lat: 13.8, lng: 69.2, name: 'ARGO Float 2901012', region: 'Arabian Sea' },
  { lat: 7.0, lng: 76.5, name: 'ARGO Float 2901345', region: 'North Indian Ocean' },
  { lat: 4.5, lng: 80.0, name: 'ARGO Float 2901678', region: 'North Indian Ocean' },
];

// ─── Standard 15 Depths ─────────────────────────────────────
export const STANDARD_DEPTHS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

// ─── Temperature Profiles ────────────────────────────────────
function generateProfile(
  loc: OceanLocation,
  baseSst: number,
  thermoclineDepth: number,
  date: string
): TemperatureProfile {
  const depths: DepthTemperature[] = STANDARD_DEPTHS.map((d) => {
    let temp: number;
    if (d <= 20) {
      temp = baseSst - d * 0.02;
    } else if (d <= thermoclineDepth) {
      temp = baseSst - 0.4 - ((d - 20) / (thermoclineDepth - 20)) * 2.5;
    } else if (d <= 300) {
      temp = baseSst - 2.9 - ((d - thermoclineDepth) / (300 - thermoclineDepth)) * 10;
    } else if (d <= 700) {
      temp = baseSst - 12.9 - ((d - 300) / 400) * 6;
    } else {
      temp = baseSst - 18.9 - ((d - 700) / 300) * 3;
    }
    temp = Math.round(temp * 10) / 10;

    const argoRef = Math.round((temp + (Math.random() - 0.5) * 1.2) * 10) / 10;
    const diff = Math.round((temp - argoRef) * 10) / 10;
    const uncertainty = Math.round((0.2 + d * 0.001 + Math.random() * 0.4) * 10) / 10;

    return { depth: d, predicted: temp, argoReference: argoRef, difference: diff, uncertainty };
  });

  return { location: loc, date, depths };
}

export const temperatureProfiles: TemperatureProfile[] = [
  generateProfile(locations[0], 28.7, 80, '2026-09-18'),
  generateProfile(locations[1], 29.1, 60, '2026-09-18'),
  generateProfile(locations[2], 28.4, 100, '2026-09-18'),
  generateProfile(locations[4], 27.9, 70, '2026-09-18'),
  generateProfile(locations[5], 28.2, 75, '2026-09-18'),
  generateProfile(locations[8], 29.0, 90, '2026-09-18'),
];

export const defaultProfile: TemperatureProfile = {
  location: locations[0],
  date: '2026-09-18',
  depths: [
    { depth: 0, predicted: 28.7, argoReference: 28.5, difference: 0.2, uncertainty: 0.3 },
    { depth: 5, predicted: 28.6, argoReference: 28.4, difference: 0.2, uncertainty: 0.3 },
    { depth: 10, predicted: 28.5, argoReference: 28.3, difference: 0.2, uncertainty: 0.3 },
    { depth: 20, predicted: 28.2, argoReference: 28.0, difference: 0.2, uncertainty: 0.4 },
    { depth: 30, predicted: 27.8, argoReference: 27.5, difference: 0.3, uncertainty: 0.4 },
    { depth: 50, predicted: 26.2, argoReference: 25.9, difference: 0.3, uncertainty: 0.5 },
    { depth: 75, predicted: 24.7, argoReference: 24.3, difference: 0.4, uncertainty: 0.5 },
    { depth: 100, predicted: 23.5, argoReference: 23.1, difference: 0.4, uncertainty: 0.6 },
    { depth: 125, predicted: 22.2, argoReference: 21.7, difference: 0.5, uncertainty: 0.6 },
    { depth: 150, predicted: 21.0, argoReference: 20.5, difference: 0.5, uncertainty: 0.7 },
    { depth: 200, predicted: 19.1, argoReference: 18.5, difference: 0.6, uncertainty: 0.7 },
    { depth: 300, predicted: 15.7, argoReference: 15.2, difference: 0.5, uncertainty: 0.8 },
    { depth: 500, predicted: 12.8, argoReference: 12.4, difference: 0.4, uncertainty: 0.7 },
    { depth: 700, predicted: 9.2, argoReference: 8.8, difference: 0.4, uncertainty: 0.6 },
    { depth: 1000, predicted: 7.2, argoReference: 6.9, difference: 0.3, uncertainty: 0.5 },
  ],
};

// ─── Ocean Observations ──────────────────────────────────────
export function getOceanObservation(location: OceanLocation, _date?: string): OceanObservation {
  if (location.lat === 15.25 && location.lng === 88.75) {
    return {
      location,
      date: _date || '2026-09-18',
      sst: 28.4,
      sss: 34.8,
      sla: 0.12,
      uCurrent: 0.28,
      vCurrent: -0.15,
      uWind: 4.2,
      vWind: 2.8,
      currentSpeed: 0.32,
      windSpeed: 5.0,
    };
  }

  // Deterministic seed based on coordinates
  const seed = Math.abs(Math.sin(location.lat * 12.9898 + location.lng * 78.233));
  const baseSst =
    location.region === 'Bay of Bengal' ? 28.3 + seed * 0.9 :
    location.region === 'Arabian Sea' ? 27.6 + seed * 1.2 : 28.1 + seed * 0.8;
  const baseSss =
    location.region === 'Bay of Bengal' ? 33.2 + seed * 1.4 :
    location.region === 'Arabian Sea' ? 35.4 + seed * 1.2 : 34.5 + seed * 0.8;

  const uCurr = Math.round((seed * 0.6 - 0.25) * 100) / 100;
  const vCurr = Math.round(((seed * 1.7 % 1) * 0.5 - 0.2) * 100) / 100;
  const uW = Math.round((2.0 + seed * 4.5) * 10) / 10;
  const vW = Math.round((1.5 + (seed * 2.3 % 1) * 3.5) * 10) / 10;

  return {
    location,
    date: _date || '2026-09-18',
    sst: Math.round(baseSst * 10) / 10,
    sss: Math.round(baseSss * 10) / 10,
    sla: Math.round((seed * 0.28 - 0.08) * 100) / 100,
    uCurrent: uCurr,
    vCurrent: vCurr,
    uWind: uW,
    vWind: vW,
    currentSpeed: Math.round(Math.sqrt(uCurr * uCurr + vCurr * vCurr) * 100) / 100,
    windSpeed: Math.round(Math.sqrt(uW * uW + vW * vW) * 10) / 10,
  };
}

export function getTemperatureProfile(location: OceanLocation, date?: string): TemperatureProfile {
  const baseSst =
    location.region === 'Bay of Bengal' ? 28.7 :
    location.region === 'Arabian Sea' ? 27.9 : 28.4;
  const thermoclineDepth = location.region === 'Bay of Bengal' ? 80 : 70;
  return generateProfile(location, baseSst, thermoclineDepth, date || '2026-09-18');
}

// ─── Anomalies ───────────────────────────────────────────────
export const anomalies: Anomaly[] = [
  {
    id: 'ANM-001',
    location: locations[0],
    depthRangeMin: 100,
    depthRangeMax: 200,
    anomalyValue: 1.8,
    severity: 'Moderate',
    description: 'Subsurface warming detected in the central Bay of Bengal between 100–200m depth.',
    detectedDate: '2026-09-18',
  },
  {
    id: 'ANM-002',
    location: locations[4],
    depthRangeMin: 50,
    depthRangeMax: 150,
    anomalyValue: 2.1,
    severity: 'High',
    description: 'Significant subsurface temperature anomaly in the central Arabian Sea.',
    detectedDate: '2026-09-17',
  },
  {
    id: 'ANM-003',
    location: locations[1],
    depthRangeMin: 200,
    depthRangeMax: 400,
    anomalyValue: 1.2,
    severity: 'Moderate',
    description: 'Intermediate-depth warming detected in northwest Bay of Bengal.',
    detectedDate: '2026-09-16',
  },
  {
    id: 'ANM-004',
    location: locations[5],
    depthRangeMin: 30,
    depthRangeMax: 100,
    anomalyValue: 2.8,
    severity: 'Marine Heatwave',
    description: 'Marine heatwave signature detected in eastern Arabian Sea subsurface layers.',
    detectedDate: '2026-09-18',
  },
  {
    id: 'ANM-005',
    location: locations[2],
    depthRangeMin: 75,
    depthRangeMax: 125,
    anomalyValue: 0.9,
    severity: 'Low',
    description: 'Minor subsurface temperature deviation in southern Bay of Bengal.',
    detectedDate: '2026-09-15',
  },
  {
    id: 'ANM-006',
    location: locations[6],
    depthRangeMin: 150,
    depthRangeMax: 300,
    anomalyValue: 1.5,
    severity: 'Moderate',
    description: 'Moderate warming anomaly in northwest Arabian Sea at intermediate depths.',
    detectedDate: '2026-09-17',
  },
  {
    id: 'ANM-007',
    location: locations[7],
    depthRangeMin: 50,
    depthRangeMax: 200,
    anomalyValue: 2.3,
    severity: 'High',
    description: 'Strong subsurface warming near Lakshadweep Islands.',
    detectedDate: '2026-09-18',
  },
  {
    id: 'ANM-008',
    location: locations[8],
    depthRangeMin: 100,
    depthRangeMax: 250,
    anomalyValue: 0.7,
    severity: 'Low',
    description: 'Slight anomaly in equatorial Indian Ocean subsurface structure.',
    detectedDate: '2026-09-14',
  },
  {
    id: 'ANM-009',
    location: locations[3],
    depthRangeMin: 30,
    depthRangeMax: 80,
    anomalyValue: 1.9,
    severity: 'Moderate',
    description: 'Coastal subsurface warming detected near Chennai coast.',
    detectedDate: '2026-09-16',
  },
  {
    id: 'ANM-010',
    location: locations[0],
    depthRangeMin: 300,
    depthRangeMax: 500,
    anomalyValue: 1.0,
    severity: 'Low',
    description: 'Deep-layer minor anomaly in central Bay of Bengal.',
    detectedDate: '2026-09-13',
  },
  {
    id: 'ANM-011',
    location: locations[4],
    depthRangeMin: 200,
    depthRangeMax: 400,
    anomalyValue: 2.5,
    severity: 'High',
    description: 'Deep subsurface heat accumulation in central Arabian Sea.',
    detectedDate: '2026-09-18',
  },
  {
    id: 'ANM-012',
    location: locations[9],
    depthRangeMin: 50,
    depthRangeMax: 150,
    anomalyValue: 0.8,
    severity: 'Low',
    description: 'Minor thermal deviation in southern Indian Ocean.',
    detectedDate: '2026-09-12',
  },
];

export function getAnomalies(filter?: string): Anomaly[] {
  if (!filter || filter === 'All') return anomalies;
  return anomalies.filter((a) => a.severity === filter);
}

// ─── Pipeline ────────────────────────────────────────────────
export const pipelineSteps: PipelineStep[] = [
  { id: 1, name: 'Fetch Data', status: 'operational', lastRun: '06:00 UTC', duration: '4m 12s', description: 'Download satellite and reanalysis data from Copernicus, ERA5, CMEMS.' },
  { id: 2, name: 'Validate', status: 'operational', lastRun: '06:05 UTC', duration: '1m 30s', description: 'Check data completeness, detect missing values and outliers.' },
  { id: 3, name: 'Preprocess', status: 'operational', lastRun: '06:07 UTC', duration: '3m 45s', description: 'Regrid, normalize, and align multi-source observations.' },
  { id: 4, name: 'Run Model', status: 'operational', lastRun: '06:11 UTC', duration: '8m 20s', description: 'Execute OceanEmbed encoder–decoder for subsurface reconstruction.' },
  { id: 5, name: 'Validate Prediction', status: 'operational', lastRun: '06:20 UTC', duration: '2m 15s', description: 'Compare reconstruction against ARGO independent observations.' },
  { id: 6, name: 'Store Results', status: 'operational', lastRun: '06:23 UTC', duration: '1m 05s', description: 'Write predictions, uncertainty, and anomaly maps to PostGIS database.' },
  { id: 7, name: 'Update Dashboard', status: 'operational', lastRun: '06:24 UTC', duration: '0m 30s', description: 'Push latest results to the visualization frontend.' },
];

export const dataSources: DataSource[] = [
  { dataset: 'SST', source: 'Copernicus', status: 'Available', lastUpdate: '06:00 UTC', records: '1.2M grid points', description: 'Sea Surface Temperature from satellite observations' },
  { dataset: 'SSS', source: 'Copernicus', status: 'Available', lastUpdate: '06:00 UTC', records: '1.2M grid points', description: 'Sea Surface Salinity from satellite observations' },
  { dataset: 'Currents (U/V)', source: 'CMEMS', status: 'Available', lastUpdate: '05:50 UTC', records: '800K grid points', description: 'Surface ocean current velocity components' },
  { dataset: 'Wind (U/V)', source: 'ERA5', status: 'Available', lastUpdate: '05:40 UTC', records: '640K grid points', description: 'Surface wind velocity components from reanalysis' },
  { dataset: 'SLA / SSH', source: 'Copernicus', status: 'Available', lastUpdate: '06:00 UTC', records: '1.2M grid points', description: 'Sea Level Anomaly / Sea Surface Height' },
  { dataset: 'GLORYS (Training)', source: 'CMEMS', status: 'Available', lastUpdate: '05:30 UTC', records: '500K profiles', description: 'Reanalysis target for model training (NOT operational input)' },
  { dataset: 'ARGO (Validation)', source: 'ARGO', status: 'Available', lastUpdate: '05:30 UTC', records: '1,284 profiles', description: 'Independent in-situ validation observations' },
];

// ─── Validation ──────────────────────────────────────────────
export const validationMetrics: ValidationMetrics = {
  rmse: 1.12,
  bias: 0.18,
  correlation: 0.94,
  validatedProfiles: 1284,
};

export const validationEntries: ValidationEntry[] = [
  { id: 'V001', location: locations[0], depth: 50, predicted: 26.2, argoValue: 25.9, error: 0.3, date: '2026-09-18' },
  { id: 'V002', location: locations[0], depth: 100, predicted: 23.5, argoValue: 23.1, error: 0.4, date: '2026-09-18' },
  { id: 'V003', location: locations[0], depth: 200, predicted: 19.1, argoValue: 18.5, error: 0.6, date: '2026-09-18' },
  { id: 'V004', location: locations[0], depth: 500, predicted: 12.8, argoValue: 12.4, error: 0.4, date: '2026-09-18' },
  { id: 'V005', location: locations[1], depth: 50, predicted: 26.8, argoValue: 26.3, error: 0.5, date: '2026-09-17' },
  { id: 'V006', location: locations[1], depth: 100, predicted: 24.1, argoValue: 23.6, error: 0.5, date: '2026-09-17' },
  { id: 'V007', location: locations[1], depth: 300, predicted: 16.2, argoValue: 15.5, error: 0.7, date: '2026-09-17' },
  { id: 'V008', location: locations[4], depth: 50, predicted: 25.6, argoValue: 25.4, error: 0.2, date: '2026-09-18' },
  { id: 'V009', location: locations[4], depth: 150, predicted: 20.5, argoValue: 20.1, error: 0.4, date: '2026-09-18' },
  { id: 'V010', location: locations[4], depth: 500, predicted: 12.1, argoValue: 11.8, error: 0.3, date: '2026-09-18' },
  { id: 'V011', location: locations[5], depth: 75, predicted: 24.9, argoValue: 24.2, error: 0.7, date: '2026-09-16' },
  { id: 'V012', location: locations[5], depth: 200, predicted: 18.8, argoValue: 18.3, error: 0.5, date: '2026-09-16' },
  { id: 'V013', location: locations[8], depth: 100, predicted: 23.8, argoValue: 23.5, error: 0.3, date: '2026-09-15' },
  { id: 'V014', location: locations[8], depth: 300, predicted: 15.4, argoValue: 14.9, error: 0.5, date: '2026-09-15' },
  { id: 'V015', location: locations[8], depth: 700, predicted: 9.0, argoValue: 8.7, error: 0.3, date: '2026-09-15' },
];

export function getArgoValidation() {
  return { metrics: validationMetrics, entries: validationEntries };
}

// ─── Depth-wise Error ────────────────────────────────────────
export const depthWiseError = [
  { depth: 0, rmse: 0.3, bias: 0.05 },
  { depth: 5, rmse: 0.3, bias: 0.06 },
  { depth: 10, rmse: 0.35, bias: 0.07 },
  { depth: 20, rmse: 0.4, bias: 0.1 },
  { depth: 30, rmse: 0.5, bias: 0.12 },
  { depth: 50, rmse: 0.65, bias: 0.15 },
  { depth: 75, rmse: 0.8, bias: 0.18 },
  { depth: 100, rmse: 0.95, bias: 0.2 },
  { depth: 125, rmse: 1.1, bias: 0.22 },
  { depth: 150, rmse: 1.2, bias: 0.24 },
  { depth: 200, rmse: 1.35, bias: 0.28 },
  { depth: 300, rmse: 1.5, bias: 0.3 },
  { depth: 500, rmse: 1.25, bias: 0.22 },
  { depth: 700, rmse: 1.0, bias: 0.18 },
  { depth: 1000, rmse: 0.8, bias: 0.12 },
];

// ─── System Health ───────────────────────────────────────────
export const systemHealthItems: SystemHealth[] = [
  { service: 'OceanEmbed Model', status: 'Operational', uptime: '99.8%', lastCheck: '06:24 UTC', details: 'PyTorch inference engine running on GPU.' },
  { service: 'FastAPI Backend', status: 'Operational', uptime: '99.9%', lastCheck: '06:24 UTC', details: 'REST API serving predictions and data.' },
  { service: 'Data Pipeline (n8n)', status: 'Operational', uptime: '99.5%', lastCheck: '06:24 UTC', details: 'Automated workflow orchestration for data ingestion.' },
  { service: 'PostgreSQL / PostGIS', status: 'Operational', uptime: '99.9%', lastCheck: '06:24 UTC', details: 'Geospatial database storing results and observations.' },
  { service: 'GPU (CUDA)', status: 'Operational', uptime: '98.2%', lastCheck: '06:24 UTC', details: 'NVIDIA GPU available for model inference.' },
  { service: 'React Frontend', status: 'Operational', uptime: '99.9%', lastCheck: '06:24 UTC', details: 'Visualization dashboard and 3D renderer.' },
];

export const systemTimeline = [
  { time: '06:24', event: 'Dashboard updated with latest predictions', status: 'success' as const },
  { time: '06:23', event: 'Results stored in PostGIS database', status: 'success' as const },
  { time: '06:20', event: 'ARGO validation completed (RMSE: 1.12°C)', status: 'success' as const },
  { time: '06:11', event: 'OceanEmbed model inference completed', status: 'success' as const },
  { time: '06:07', event: 'Data preprocessing completed', status: 'success' as const },
  { time: '06:05', event: 'Data validation passed', status: 'success' as const },
  { time: '06:00', event: 'Satellite data fetch initiated', status: 'success' as const },
  { time: '00:00', event: 'Daily pipeline cycle started', status: 'success' as const },
];

// ─── Ocean State Summary (Dashboard) ─────────────────────────
export const oceanStateSummary = {
  sst: { value: 28.7, unit: '°C', label: 'Sea Surface Temperature', abbr: 'SST' },
  sss: { value: 34.4, unit: 'PSU', label: 'Sea Surface Salinity', abbr: 'SSS' },
  sla: { value: 0.12, unit: 'm', label: 'Sea Level Anomaly', abbr: 'SLA' },
  currentSpeed: { value: 0.42, unit: 'm/s', label: 'Current Speed', abbr: 'Current' },
  windSpeed: { value: 6.1, unit: 'm/s', label: 'Wind Speed', abbr: 'Wind' },
  thermoclineDepth: { value: 78, unit: 'm', label: 'Est. Thermocline Depth', abbr: 'Thermocline' },
};

// ─── Scatter Data for Validation ─────────────────────────────
export const scatterValidation = defaultProfile.depths.map((d) => ({
  predicted: d.predicted,
  argo: d.argoReference,
  depth: d.depth,
}));

// ─── Anomaly Depth Chart ─────────────────────────────────────
export const anomalyDepthData = [
  { depth: 0, anomaly: 0.2 },
  { depth: 50, anomaly: 0.8 },
  { depth: 100, anomaly: 1.8 },
  { depth: 150, anomaly: 1.5 },
  { depth: 200, anomaly: 1.2 },
  { depth: 300, anomaly: 0.7 },
  { depth: 500, anomaly: 0.4 },
  { depth: 700, anomaly: 0.2 },
  { depth: 1000, anomaly: 0.1 },
];
