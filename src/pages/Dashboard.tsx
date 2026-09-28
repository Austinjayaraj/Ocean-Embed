import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Compass, Layers, Thermometer, Box, AlertTriangle,
  CheckCircle, ArrowRight, RotateCcw,
  Sparkles, Cpu
} from 'lucide-react';
import RealisticEarth from '../components/ocean/RealisticEarth';
import SubsurfaceReconstructionDive from '../components/ocean/SubsurfaceReconstructionDive';
import { locations, getOceanObservation } from '../data/mockData';
import type { OceanLocation } from '../types/ocean';

type GlobeMissionPhase = 'globe' | 'parameters' | 'encoder' | 'dive';

export default function Dashboard() {
  const navigate = useNavigate();
  // Default to Bay of Bengal (lat 15.25, lng 88.75) as requested
  const [selectedLoc, setSelectedLoc] = useState<OceanLocation>(locations[0]);
  const [phase, setPhase] = useState<GlobeMissionPhase>('globe');

  const obs = useMemo(() => getOceanObservation(selectedLoc), [selectedLoc]);

  // Derived vector speeds
  const currentSpeed = Math.round(Math.sqrt(obs.uCurrent * obs.uCurrent + obs.vCurrent * obs.vCurrent) * 100) / 100;
  const windSpeed = Math.round(Math.sqrt(obs.uWind * obs.uWind + obs.vWind * obs.vWind) * 10) / 10;

  // 64 Latent Embedding coordinates
  const latentPreview = useMemo(() => {
    const seed = obs.sst * 1.5 + obs.sss * 0.8 + obs.sla * 10;
    return Array.from({ length: 32 }, (_, i) => {
      const v = Math.sin(seed + i * 0.42);
      return Math.round(v * 100) / 100;
    });
  }, [obs]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020612] select-none font-mono-tech">
      {/* ── 1. FULL-SCREEN 3D EARTH HERO CANVAS ──────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0">
        {phase === 'dive' ? (
          <div className="w-full h-full pt-14 pb-16 px-4 max-w-7xl mx-auto flex flex-col justify-center">
            <SubsurfaceReconstructionDive
              location={selectedLoc}
              onCompleteProfile={() => navigate('/profile')}
              onOpenXRay={() => navigate('/ocean-xray')}
              onBackToEncoder={() => setPhase('encoder')}
            />
          </div>
        ) : (
          <RealisticEarth
            selectedLocation={selectedLoc}
            onLocationSelect={(loc) => {
              setSelectedLoc(loc);
              if (phase !== 'globe') setPhase('globe');
            }}
            showArgo={true}
            showAnomalies={true}
            onExploreSurfaceData={() => setPhase('parameters')}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* ── 2. FLOATING STAGE 2: SURFACE PARAMETER INSTRUMENTS OVER GLOBE ───── */}
      <AnimatePresence>
        {phase === 'parameters' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-4 sm:left-8 z-30 max-w-md w-full ocean-panel-glow p-4 border-cyan-400/50 backdrop-blur-xl shadow-2xl space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  SURFACE OBSERVATION RECEPTOR
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedLoc.lat.toFixed(2)}°N, {selectedLoc.lng.toFixed(2)}°E
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-white tracking-wide">{selectedLoc.name}</p>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Multi-sensor satellite boundary conditions locked for neural inference.
              </p>
            </div>

            {/* 7 Surface Instrument Values */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-[#020712]/90 border border-red-500/25">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>SST</span>
                  <span className="text-red-400">OPTIMAL</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {obs.sst} <span className="text-xs text-red-300 font-normal">°C</span>
                </div>
                <span className="text-[8px] text-slate-500 truncate block">CMEMS OSTIA IR</span>
              </div>

              <div className="p-2 rounded bg-[#020712]/90 border border-blue-500/25">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>SSS</span>
                  <span className="text-cyan-400">HALINE</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {obs.sss} <span className="text-xs text-cyan-300 font-normal">PSU</span>
                </div>
                <span className="text-[8px] text-slate-500 truncate block">SMOS/SMAP L4</span>
              </div>

              <div className="p-2 rounded bg-[#020712]/90 border border-teal-500/25">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>SLA</span>
                  <span className="text-teal-300">EXPANSION</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {obs.sla > 0 ? `+${obs.sla.toFixed(2)}` : obs.sla.toFixed(2)} <span className="text-xs text-teal-300 font-normal">m</span>
                </div>
                <span className="text-[8px] text-slate-500 truncate block">Sentinel-3 Altimetry</span>
              </div>

              <div className="p-2 rounded bg-[#020712]/90 border border-emerald-500/25">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>CURRENT (U/V)</span>
                  <span className="text-emerald-400">DRIFT</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {currentSpeed} <span className="text-xs text-emerald-300 font-normal">m/s</span>
                </div>
                <span className="text-[8px] text-slate-500 truncate block">
                  U: {obs.uCurrent > 0 ? `+${obs.uCurrent}` : obs.uCurrent} · V: {obs.vCurrent > 0 ? `+${obs.vCurrent}` : obs.vCurrent}
                </span>
              </div>

              <div className="col-span-2 p-2 rounded bg-[#020712]/90 border border-purple-500/25">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>WIND 10m (U/V)</span>
                  <span className="text-purple-300">ERA5 STRESS</span>
                </div>
                <div className="flex justify-between items-baseline mt-0.5">
                  <div className="text-base font-bold text-white">
                    {windSpeed} <span className="text-xs text-purple-300 font-normal">m/s</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    U: {obs.uWind > 0 ? `+${obs.uWind}` : obs.uWind}m/s · V: {obs.vWind > 0 ? `+${obs.vWind}` : obs.vWind}m/s
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-2">
              <button
                onClick={() => setPhase('globe')}
                className="px-3 py-2 rounded bg-[#020712] hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setPhase('encoder')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.35)] transition-all cursor-pointer"
              >
                <span>CONVERGE TO ENCODER</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. FLOATING STAGE 3: OCEAN STATE ENCODER OVER GLOBE ────────────── */}
      <AnimatePresence>
        {phase === 'encoder' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-4 sm:left-8 z-30 max-w-lg w-full ocean-panel-glow p-4 border-cyan-400/50 backdrop-blur-xl shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-[#18BFEF] animate-pulse" />
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  OCEAN STATE ENCODER
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                LATENT SYNC
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wide">
                Surface Convergence → 64-D Latent Manifold
              </p>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                The 7 surface boundary observations converge through the deep neural encoder, projecting non-linear dynamics into continuous latent coordinates.
              </p>
            </div>

            {/* Latent Vector 32-node Grid Preview */}
            <div className="p-2.5 rounded bg-[#020712] border border-cyan-500/20 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>LATENT EMBEDDING: z ∈ ℝ⁶⁴</span>
                <span className="text-cyan-300 font-bold">14ms Inference</span>
              </div>
              <div className="grid grid-cols-8 gap-1 pt-1">
                {latentPreview.map((val, idx) => (
                  <div
                    key={idx}
                    className="h-4 rounded-xs text-[8px] flex items-center justify-center font-mono-tech border border-cyan-500/20"
                    style={{
                      backgroundColor: val >= 0 ? `rgba(24, 191, 239, ${0.15 + Math.abs(val) * 0.6})` : `rgba(8, 102, 198, ${0.15 + Math.abs(val) * 0.6})`,
                      color: '#ffffff',
                    }}
                    title={`z[${idx}] = ${val}`}
                  >
                    {val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 pt-0.5">
                <span>z₀ (Thermal Skin)</span>
                <span>z₁₆ (Thermocline Shear)</span>
                <span>z₃₁ (Abyssal Geostrophy)</span>
              </div>
            </div>

            {/* Depth Decoder Target */}
            <div className="p-2.5 rounded bg-[#020712] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Continuous Decoder</span>
                <span className="text-white font-bold">f_θ(z, depth) → T(depth)</span>
              </div>
              <span className="text-teal-300 font-bold text-[11px] px-2 py-0.5 rounded bg-[#061e38] border border-cyan-500/25">
                15 Levels (0–1000m)
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-2">
              <button
                onClick={() => setPhase('parameters')}
                className="px-3 py-2 rounded bg-[#020712] hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setPhase('dive')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(24,191,239,0.4)] transition-all cursor-pointer animate-pulse"
              >
                <Sparkles size={14} className="text-cyan-200" />
                <span>RECONSTRUCT SUBSURFACE OCEAN</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. FLOATING MISSION NAVIGATION DOCK (Section 7 Specification) ────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[95vw] pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[#020a16]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(24,191,239,0.15)] text-[11px] overflow-x-auto">
          {[
            { id: 'globe', label: 'GLOBAL', icon: Globe, onClick: () => setPhase('globe'), active: phase === 'globe' },
            { id: 'explorer', label: 'EXPLORER', icon: Compass, onClick: () => navigate('/explorer'), active: false },
            { id: 'surface', label: 'SURFACE', icon: Layers, onClick: () => setPhase('parameters'), active: phase === 'parameters' },
            { id: 'profile', label: 'PROFILE', icon: Thermometer, onClick: () => navigate('/profile'), active: false },
            { id: 'xray', label: 'X-RAY', icon: Box, onClick: () => navigate('/ocean-xray'), active: false },
            { id: 'anomalies', label: 'ANOMALIES', icon: AlertTriangle, onClick: () => navigate('/anomalies'), active: false },
            { id: 'validation', label: 'VALIDATION', icon: CheckCircle, onClick: () => navigate('/validation'), active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  item.active
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 border border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(24,191,239,0.3)]'
                    : 'bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={12} className={item.active ? 'text-cyan-300' : 'text-slate-400'} />
                <span className="text-[10px] tracking-wider uppercase font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
