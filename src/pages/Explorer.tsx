import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Sparkles, Layers, Cpu
} from 'lucide-react';
import RealisticEarth from '../components/ocean/RealisticEarth';
import OceanDiveExperience from '../components/ocean/OceanDiveExperience';
import OceanEmbeddingVisualizer from '../components/ocean/OceanEmbeddingVisualizer';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import Tooltip from '../components/common/Tooltip';
import DemoBadge from '../components/common/DemoBadge';
import { locations, getOceanObservation } from '../data/mockData';
import type { OceanLocation, OceanVariable, Region } from '../types/ocean';

const VARIABLES: OceanVariable[] = [
  'SST', 'SSS', 'SLA', 'U Current', 'V Current', 'Wind U', 'Wind V',
  'Predicted Temperature', 'Uncertainty', 'Anomaly'
];
const REGIONS: Region[] = ['North Indian Ocean', 'Arabian Sea', 'Bay of Bengal'];
const DEPTHS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

export default function Explorer() {
  const navigate = useNavigate();
  const [selectedLoc, setSelectedLoc] = useState<OceanLocation>(locations[0]);
  const [region, setRegion] = useState<Region>('Bay of Bengal');
  const [lat, setLat] = useState('12.0');
  const [lng, setLng] = useState('85.0');
  const [date] = useState('2026-09-18');
  const [depth, setDepth] = useState(0);
  const [variable, setVariable] = useState<OceanVariable>('SST');
  const [diveModalOpen, setDiveModalOpen] = useState(false);
  const [reconstructed, setReconstructed] = useState(false);

  const obs = getOceanObservation(selectedLoc, date);

  function handleLocSelect(loc: OceanLocation) {
    setSelectedLoc(loc);
    setLat(loc.lat.toFixed(1));
    setLng(loc.lng.toFixed(1));
    setRegion(loc.region);
    setReconstructed(false);
  }

  function handleRegionChange(newRegion: Region) {
    setRegion(newRegion);
    const loc = locations.find((l) => l.region === newRegion) || locations[0];
    handleLocSelect(loc);
  }

  function handleStartReconstruction() {
    setDiveModalOpen(true);
    setReconstructed(true);
  }

  return (
    <div className="space-y-6 font-mono-tech">
      {/* ── Signature Dive Modal ───────────────────────────────── */}
      <OceanDiveExperience
        location={selectedLoc}
        isOpen={diveModalOpen}
        onClose={() => setDiveModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              OCEAN STATE EXPLORER
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Interactive 3D navigation console. Select any coordinates in the North Indian Ocean to inspect surface observations and trigger AI subsurface reconstruction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartReconstruction()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.35)] transition-all cursor-pointer"
          >
            <Sparkles size={14} className="text-cyan-200" />
            <span>RECONSTRUCT SUBSURFACE</span>
          </button>
        </div>
      </div>

      {/* Control Console Toolbar */}
      <div className="ocean-panel p-3.5 flex flex-wrap gap-4 items-end text-xs">
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            REGION
          </label>
          <select
            value={region}
            onChange={(e) => handleRegionChange(e.target.value as Region)}
            className="h-8 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r} className="bg-[#030d1d] text-white">
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            LOCATION PRESET
          </label>
          <select
            value={selectedLoc.name}
            onChange={(e) => {
              const loc = locations.find((l) => l.name === e.target.value);
              if (loc) handleLocSelect(loc);
            }}
            className="h-8 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            {locations.map((loc) => (
              <option key={loc.name} value={loc.name} className="bg-[#030d1d] text-white">
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            LATITUDE (°N)
          </label>
          <input
            type="number"
            step="0.1"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="h-8 w-24 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            LONGITUDE (°E)
          </label>
          <input
            type="number"
            step="0.1"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="h-8 w-24 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            DEPTH LEVEL
          </label>
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="h-8 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            {DEPTHS.map((d) => (
              <option key={d} value={d} className="bg-[#030d1d] text-white">
                {d} m
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            VARIABLE
          </label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value as OceanVariable)}
            className="h-8 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            {VARIABLES.map((v) => (
              <option key={v} value={v} className="bg-[#030d1d] text-white">
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive 3D Globe + Mission Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D Realistic Earth Globe (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <RealisticEarth
            selectedLocation={selectedLoc}
            onLocationSelect={handleLocSelect}
            showArgo={true}
            showAnomalies={true}
            onExploreSurfaceData={() => navigate('/surface-data')}
            onReconstructClick={() => handleStartReconstruction()}
            style={{ height: 500 }}
          />
        </div>

        {/* Selected Coordinate Telemetry + Actions (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {/* Location details card */}
          <div className="ocean-panel p-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-500/20 text-xs">
              <Compass size={14} className="text-[#18BFEF]" />
              <h3 className="font-bold text-white uppercase tracking-wider">Target Coordinate</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-cyan-300 font-bold">{selectedLoc.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-white font-semibold">{selectedLoc.lat.toFixed(2)}°N, {selectedLoc.lng.toFixed(2)}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ocean Basin:</span>
                <span className="text-emerald-400 font-semibold">{selectedLoc.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">18 Sep 2026, 06:00 UTC</span>
              </div>
            </div>
          </div>

          {/* 7 Surface Observations Card */}
          <div className="ocean-panel p-4">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-cyan-500/20 text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" /> Surface Variables (7)
              </span>
              <DemoBadge />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'SST', tip: 'Sea Surface Temp', val: `${obs.sst} °C`, col: '#EF4444' },
                { label: 'SSS', tip: 'Sea Surface Salinity', val: `${obs.sss} PSU`, col: '#0866C6' },
                { label: 'SLA', tip: 'Sea Level Anomaly', val: `${obs.sla > 0 ? '+' : ''}${obs.sla} m`, col: '#18BFEF' },
                { label: 'U CURRENT', tip: 'Zonal current', val: `${obs.uCurrent} m/s`, col: '#45D6C8' },
                { label: 'V CURRENT', tip: 'Meridional current', val: `${obs.vCurrent} m/s`, col: '#45D6C8' },
                { label: 'WIND SPEED', tip: 'Surface wind', val: `${obs.windSpeed} m/s`, col: '#A78BFA' },
              ].map((item) => (
                <div key={item.label} className="p-2 rounded bg-[#030d1d]/80 border border-slate-800">
                  <Tooltip text={item.tip}>
                    <span className="text-[10px] text-slate-400 uppercase block cursor-help">{item.label}</span>
                  </Tooltip>
                  <span className="text-sm font-bold block mt-0.5" style={{ color: item.col }}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reconstruction CTA Card */}
          <div className="ocean-panel-glow p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Cpu size={14} className="text-[#18BFEF]" /> OceanEmbed v1.0
              </span>
              <StatusBadge status="operational" label="Ready" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-3">
              Trigger encoder–decoder pipeline to expand these 7 surface variables into 15 subsurface depth levels down to 1000m.
            </p>

            <button
              onClick={() => handleStartReconstruction()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.35)] transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>RECONSTRUCT SUBSURFACE</span>
            </button>

            {reconstructed && (
              <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-1.5 px-2 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] text-center font-bold"
                >
                  View Profile →
                </button>
                <button
                  onClick={() => navigate('/ocean-xray')}
                  className="flex-1 py-1.5 px-2 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[11px] text-center font-bold"
                >
                  3D X-Ray →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Ocean Embedding Architecture Showcase */}
      <div className="mt-6">
        <SectionHeader
          title="Ocean Embedding Neural Transformation"
          subtitle="Physical surface constraints mapped into 64-dimensional latent ocean state manifold and decoded across depth"
        />
        <OceanEmbeddingVisualizer />
      </div>
    </div>
  );
}
