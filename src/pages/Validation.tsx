import { useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import {
  CheckCircle, Target, TrendingUp, BarChart2, Hash
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
import DataTable from '../components/common/DataTable';
import {
  validationMetrics, validationEntries, scatterValidation,
  depthWiseError, defaultProfile
} from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

const columns = [
  {
    key: 'location',
    label: 'LOCATION',
    render: (_v: unknown, row: unknown) => {
      const loc = (row as Record<string, unknown>).location as { name: string };
      return <span className="text-xs font-semibold text-slate-200">{loc.name}</span>;
    },
  },
  { key: 'depth', label: 'DEPTH', render: (v: unknown) => <span className="font-mono-tech text-cyan-300 font-bold">{String(v)} m</span> },
  { key: 'predicted', label: 'PREDICTED', render: (v: unknown) => <span className="font-mono-tech text-white font-bold">{String(v)} °C</span> },
  { key: 'argoValue', label: 'ARGO FLOAT', render: (v: unknown) => <span className="font-mono-tech text-teal-300 font-bold">{String(v)} °C</span> },
  {
    key: 'error',
    label: 'ERROR DELTA',
    render: (v: unknown) => {
      const err = v as number;
      const color = err < 0.4 ? '#22C55E' : err < 0.7 ? '#F59E0B' : '#EF4444';
      return <span className="font-mono-tech font-bold" style={{ color }}>±{err} °C</span>;
    },
  },
  { key: 'date', label: 'TIMESTAMP', render: (v: unknown) => <span className="text-xs text-slate-400">{String(v)}</span> },
];

// 3D Twin Column Visualization: OceanEmbed Prediction vs ARGO In-Situ Observation
function TwinColumnScene({ currentDepth }: { currentDepth: number }) {
  const yScan = 2.2 - (currentDepth / 1000) * 4.4;

  return (
    <group>
      {/* Left Column: OceanEmbed Prediction (Cyan) */}
      <group position={[-1.6, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.75, 0.75, 4.4, 24, 1, true]} />
          <meshBasicMaterial color="#18BFEF" wireframe transparent opacity={0.35} />
        </mesh>
        <group position={[0, yScan, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.73, 24]} />
            <meshBasicMaterial color="#18BFEF" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Right Column: ARGO Float Observation (Teal) */}
      <group position={[1.6, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.75, 0.75, 4.4, 24, 1, true]} />
          <meshBasicMaterial color="#45D6C8" wireframe transparent opacity={0.35} />
        </mesh>
        <group position={[0, yScan, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.73, 24]} />
            <meshBasicMaterial color="#45D6C8" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Connector verification laser line across twin columns */}
      <mesh position={[0, yScan, 0]}>
        <boxGeometry args={[3.2, 0.04, 0.04]} />
        <meshBasicMaterial color="#38BDF8" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Validation() {
  const [activeDepth, setActiveDepth] = useState(100);

  const matchedLevel =
    defaultProfile.depths.find((d) => d.depth === activeDepth) || defaultProfile.depths[7];

  return (
    <div className="space-y-6 font-mono-tech">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-[#22C55E]" />
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              Independent ARGO Float Validation
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1 max-w-3xl">
            Statistical rigor and in-situ ground truth verification. ARGO floats are physically deployed ocean robots whose
            CTD sensor profiles are strictly <strong>held out from training</strong> to independently evaluate OceanEmbed.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            1,284 Held-Out ARGO Profiles
          </span>
        </div>
      </motion.div>

      {/* Critical Scientific Distinction Callout */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-950/40 border border-blue-500/25">
          <div className="w-7 h-7 rounded bg-blue-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            TR
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-300 uppercase">GLORYS Reanalysis (Training Target)</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 font-sans">
              High-resolution global ocean reanalysis target used during offline PyTorch neural network training.
              Not used as an operational input at inference time.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/25">
          <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            IN
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300 uppercase">ARGO In-Situ CTD (Independent Validation)</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 font-sans">
              Autonomous physical robotic profiling floats taking direct in-situ measurements.
              Held out completely to ensure objective scientific verification.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="RMSE ACCURACY" value={`${validationMetrics.rmse}°C`} icon={<Target size={16} />} color="#22C55E" subtitle="Root mean squared error" />
        <KpiCard title="MEAN BIAS" value={`+${validationMetrics.bias}°C`} icon={<TrendingUp size={16} />} color="#18BFEF" subtitle="Minimal systemic drift" />
        <KpiCard title="CORRELATION (R)" value={validationMetrics.correlation} icon={<BarChart2 size={16} />} color="#45D6C8" subtitle="Pearson coefficient (0–1)" />
        <KpiCard title="VALIDATED PROFILES" value={validationMetrics.validatedProfiles} icon={<Hash size={16} />} color="#0866C6" subtitle="North Indian Ocean basin" />
      </motion.div>

      {/* 3D Twin Column Comparison: Prediction vs Observation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D Dual Column Viewport (5 Cols) */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-5 ocean-panel p-4 flex flex-col justify-between"
        >
          <div>
            <SectionHeader
              title="3D Twin Column Verification"
              subtitle="Synchronized depth comparison: OceanEmbed vs ARGO"
            />
            <div className="h-64 w-full relative rounded-lg bg-[#020713] overflow-hidden border border-cyan-500/20">
              <Canvas camera={{ position: [0, 0, 4.4], fov: 46 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 5, 4]} intensity={1.5} color="#18BFEF" />
                <TwinColumnScene currentDepth={activeDepth} />
              </Canvas>

              {/* Labels overlay */}
              <div className="absolute top-2 left-4 text-[10px] text-cyan-300 font-bold">
                OCEANEMBED PREDICTION
              </div>
              <div className="absolute top-2 right-4 text-[10px] text-teal-300 font-bold text-right">
                ARGO FLOAT OBSERVED
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#030d1d]/90 border border-cyan-500/30 text-[10px] text-white">
                DEPTH: {activeDepth}m
              </div>
            </div>
          </div>

          {/* Depth Scrubber */}
          <div className="mt-4 pt-3 border-t border-cyan-500/15">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400">SCRUB VERIFICATION DEPTH:</span>
              <span className="text-cyan-300 font-bold">{activeDepth} m</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={25}
              value={activeDepth}
              onChange={(e) => setActiveDepth(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            {/* Quick depth preset buttons */}
            <div className="flex items-center gap-1 mt-2">
              {[0, 50, 100, 250, 500, 1000].map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDepth(d)}
                  className={`flex-1 py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                    activeDepth === d
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-[#020712] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">PREDICTED</span>
                <span className="text-sm font-bold text-cyan-300">{matchedLevel.predicted.toFixed(1)}°C</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">ARGO IN-SITU</span>
                <span className="text-sm font-bold text-teal-300">{matchedLevel.argoReference?.toFixed(1) ?? '—'}°C</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">DELTA ERROR</span>
                <span className="text-sm font-bold text-emerald-400">±{matchedLevel.difference ?? 0.2}°C</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistical Correlation & Depth Error Charts (7 Cols) */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-7 ocean-panel p-5 flex flex-col justify-between"
        >
          <div>
            <SectionHeader
              title="Predicted vs. Observed Correlation (R = 0.94)"
              subtitle="45° identity line indicates optimal agreement across 0–1000m profiles"
            />
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="predicted"
                    name="Predicted"
                    domain={[5, 32]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(v) => `${v}°`}
                    label={{ value: 'Predicted Temp (°C)', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#94a3b8' } }}
                  />
                  <YAxis
                    type="number"
                    dataKey="argo"
                    name="ARGO"
                    domain={[5, 32]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(v) => `${v}°`}
                    label={{ value: 'ARGO In-Situ (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ background: '#071527', border: '1px solid #18BFEF', borderRadius: '6px', fontSize: '11px' }}
                    formatter={(val, name) => [`${val}°C`, name === 'predicted' ? 'Predicted' : 'ARGO']}
                  />
                  <ReferenceLine segment={[{ x: 6, y: 6 }, { x: 30, y: 30 }]} stroke="#45D6C8" strokeDasharray="4 4" />
                  <Scatter name="Validation Points" data={scatterValidation} fill="#18BFEF" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/15">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Depth-Wise RMSE Error Profile (0–1000m):
            </span>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depthWiseError} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="depth" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${v}m`} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: '#071527', border: '1px solid #18BFEF', borderRadius: '6px', fontSize: '11px' }}
                    formatter={(val) => [`${val}°C`, 'RMSE']}
                  />
                  <Area type="monotone" dataKey="rmse" stroke="#18BFEF" fill="#18BFEF25" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validation Table */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <SectionHeader
          title="Recent In-Situ Matchup Samples"
          subtitle="Point-by-point evaluation of OceanEmbed predictions against ARGO floats"
        />
        <DataTable
          columns={columns}
          data={validationEntries as unknown as Record<string, unknown>[]}
        />
      </motion.div>
    </div>
  );
}
