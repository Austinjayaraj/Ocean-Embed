import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { MapPin, Info, ArrowRight } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import DataTable from '../components/common/DataTable';
import TemperatureDepthChart from '../components/charts/TemperatureDepthChart';
import { locations, STANDARD_DEPTHS, getTemperatureProfile } from '../data/mockData';
import type { OceanLocation } from '../types/ocean';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

function diffColor(diff: number | null): string {
  if (diff === null) return '#94A3B8';
  const abs = Math.abs(diff);
  if (abs < 0.4) return '#22C55E';
  if (abs < 0.7) return '#F59E0B';
  return '#EF4444';
}

const columns = [
  {
    key: 'depth',
    label: 'DEPTH',
    render: (v: unknown) => <span className="font-mono-tech font-bold text-cyan-300">{String(v)} m</span>
  },
  {
    key: 'predicted',
    label: 'PREDICTED (°C)',
    render: (v: unknown) => <span className="font-mono-tech text-white font-bold">{String(v)} °C</span>
  },
  {
    key: 'argoReference',
    label: 'ARGO REF (°C)',
    render: (v: unknown) => <span className="font-mono-tech text-cyan-400">{v !== null ? `${String(v)} °C` : '—'}</span>
  },
  {
    key: 'difference',
    label: 'ERROR / DELTA',
    render: (v: unknown) => {
      const diff = v as number | null;
      return (
        <span className="font-mono-tech font-bold" style={{ color: diffColor(diff) }}>
          {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '—'} °C
        </span>
      );
    },
  },
  {
    key: 'uncertainty',
    label: 'UNCERTAINTY',
    render: (v: unknown) => <span className="font-mono-tech text-amber-400 font-semibold">±{String(v)} °C</span>
  },
];

// Interactive 3D Ocean Depth Column
function Interactive3DColumn({ currentDepth }: { currentDepth: number }) {
  const yScan = 2.4 - (currentDepth / 1000) * 4.8;

  return (
    <group>
      {/* Cylindrical column water body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 4.8, 24, 1, true]} />
        <meshBasicMaterial color="#0866C6" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Standard depth level rings */}
      {STANDARD_DEPTHS.map((d) => {
        const y = 2.4 - (d / 1000) * 4.8;
        const isPassed = currentDepth >= d;
        return (
          <group key={d} position={[0, y, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.05, 1.12, 24]} />
              <meshBasicMaterial
                color={d <= 80 ? '#FF6B35' : d <= 300 ? '#45D6C8' : '#0866C6'}
                transparent
                opacity={isPassed ? 0.9 : 0.25}
              />
            </mesh>
          </group>
        );
      })}

      {/* Active cursor disc at current depth */}
      <group position={[0, yScan, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.08, 32]} />
          <meshBasicMaterial color="#18BFEF" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color="#18BFEF" intensity={2} distance={2.5} />
      </group>
    </group>
  );
}

export default function TemperatureProfile() {
  const navigate = useNavigate();
  const [selectedDepth, setSelectedDepth] = useState(100);
  const [selectedLoc, setSelectedLoc] = useState<OceanLocation>(locations[0]);

  const profile = useMemo(() => getTemperatureProfile(selectedLoc), [selectedLoc]);

  const activeLevel = useMemo(() => {
    return profile.depths.find((d) => d.depth === selectedDepth) ||
      profile.depths.reduce((prev, curr) =>
        Math.abs(curr.depth - selectedDepth) < Math.abs(prev.depth - selectedDepth) ? curr : prev
      );
  }, [profile, selectedDepth]);

  const DEPTH_PRESETS = [0, 50, 100, 200, 500, 1000];

  return (
    <div className="space-y-5 font-mono-tech">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              Subsurface Temperature Profile (0–1000m)
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 font-sans max-w-3xl">
            Reconstructed 15-level thermal structure predicted by OceanEmbed from multi-satellite surface observables.
            Independently verified against ARGO in-situ CTD profiling floats.
          </p>
        </div>

        <button
          onClick={() => navigate('/ocean-xray')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.35)] transition-all cursor-pointer flex-shrink-0"
        >
          <span>OPEN 3D OCEAN X-RAY</span>
          <ArrowRight size={13} />
        </button>
      </motion.div>

      {/* Location Bar with quick switcher */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-wrap items-center justify-between gap-3 ocean-panel px-4 py-3"
      >
        <div className="flex items-center gap-3 text-xs">
          <MapPin size={15} className="text-[#18BFEF] animate-pulse" />
          <span className="text-white font-bold">{selectedLoc.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-bold">{selectedLoc.lat.toFixed(2)}°N, {selectedLoc.lng.toFixed(2)}°E</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">{selectedLoc.region}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">18 Sep 2026</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Switch Region:</span>
          {locations.slice(0, 4).map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedLoc(loc)}
              className={`px-2 py-0.5 rounded border text-[11px] transition-colors cursor-pointer ${
                selectedLoc.name === loc.name
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-[#030d1d] border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 3D Vertical Ocean Column + Interactive Chart Dual-View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D Interactive Depth Column (4 Cols) */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-4 ocean-panel p-4 flex flex-col justify-between"
        >
          <div>
            <SectionHeader
              title="3D Ocean Column"
              subtitle="Scrub depth to inspect layer stratification"
            />
            <div className="h-64 w-full relative rounded-lg bg-[#020713] overflow-hidden border border-cyan-500/20">
              <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 5, 4]} intensity={1.5} color="#18BFEF" />
                <Interactive3DColumn currentDepth={selectedDepth} />
              </Canvas>

              {/* Depth readout tag */}
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#030d1d]/90 border border-cyan-400/40 text-[10px] text-cyan-300 shadow-md">
                DEPTH: <strong className="text-white">{selectedDepth}m</strong>
              </div>
            </div>
          </div>

          {/* Depth Scrubber & Presets */}
          <div className="mt-4 pt-3 border-t border-cyan-500/15 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">DEPTH CONTROLLER:</span>
              <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                {selectedDepth} METERS
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1000}
              step={25}
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(Number(e.target.value))}
              className="w-full cursor-pointer"
            />

            {/* Quick depth preset buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {DEPTH_PRESETS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDepth(d)}
                  className={`flex-1 min-w-[42px] py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                    selectedDepth === d
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-[#020712] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>

            {/* Telemetry at current selected depth */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">PREDICTED TEMP</span>
                <span className="text-sm font-bold text-white">{activeLevel.predicted.toFixed(1)} °C</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">ARGO IN-SITU</span>
                <span className="text-sm font-bold text-teal-300">{activeLevel.argoReference?.toFixed(1) ?? '—'} °C</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">ANOMALY / DELTA</span>
                <span className="text-sm font-bold" style={{ color: diffColor(activeLevel.difference) }}>
                  {activeLevel.difference !== null ? (activeLevel.difference > 0 ? `+${activeLevel.difference}` : activeLevel.difference) : '—'} °C
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase">CONFIDENCE</span>
                <span className="text-xs font-semibold text-amber-300 mt-0.5 block">
                  ±{activeLevel.uncertainty.toFixed(1)} °C (DEMO)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Temperature vs Depth Chart (8 Cols) */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-8 ocean-panel p-5"
        >
          <SectionHeader
            title="Temperature vs. Depth Profile Curve (0–1000m)"
            subtitle="OceanEmbed neural reconstruction vs ARGO in-situ held-out validation float"
          >
            <div className="flex items-center gap-3 text-xs font-mono-tech">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span className="inline-block w-4 h-1 bg-[#18BFEF] rounded" /> Predicted
              </span>
              <span className="flex items-center gap-1.5 text-teal-300 font-bold">
                <span className="inline-block w-4 h-1 border-t-2 border-dashed border-[#45D6C8]" /> ARGO In-Situ
              </span>
            </div>
          </SectionHeader>

          <TemperatureDepthChart data={profile.depths} height={360} showThermocline={true} />

          <div className="mt-3 p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Info size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>Hydrographic Stratification:</strong> The sharp thermocline transition occurs between 50m and 125m,
              where temperature drops sharply from ~26.2°C to 22.2°C. Below 500m, water stabilizes toward the 7.2°C deep ocean floor.
            </p>
          </div>
        </motion.div>
      </div>

      {/* 15 Standard Depths Data Table */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <SectionHeader
          title="Hydrographic Standard Levels (15 Depths)"
          subtitle={`Full numerical profile with point-wise error and uncertainty bounds · ${selectedLoc.name}`}
        />
        <DataTable
          columns={columns}
          data={profile.depths as unknown as Record<string, unknown>[]}
        />
      </motion.div>
    </div>
  );
}
