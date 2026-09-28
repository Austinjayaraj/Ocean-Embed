import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurfaceParametersInstrument from '../components/ocean/SurfaceParametersInstrument';
import OceanStateConvergence from '../components/ocean/OceanStateConvergence';
import SubsurfaceReconstructionDive from '../components/ocean/SubsurfaceReconstructionDive';
import { locations, getOceanObservation } from '../data/mockData';
import type { OceanLocation } from '../types/ocean';
import { Globe, MapPin } from 'lucide-react';
import DemoBadge from '../components/common/DemoBadge';

export default function SurfaceData() {
  const navigate = useNavigate();
  const [selectedLoc, setSelectedLoc] = useState<OceanLocation>(locations[0]);
  const [activeStage, setActiveStage] = useState<'parameters' | 'convergence' | 'dive'>('parameters');

  const obs = getOceanObservation(selectedLoc);

  return (
    <div className="space-y-5 font-mono-tech">
      {/* Top Header & Stage Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display flex items-center gap-2">
              <Globe size={20} className="text-[#18BFEF]" />
              SURFACE PARAMETERS & CONVERGENCE
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
              0.25° SATELLITE CHANNELS
            </span>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Observe the 7 satellite & reanalysis surface variables locked across the North Indian Ocean basin, and converge them into the Ocean State Encoder.
          </p>
        </div>

        {/* Location Dropdown Quick Switcher */}
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-cyan-400" />
          <select
            value={selectedLoc.name}
            onChange={(e) => {
              const found = locations.find((l) => l.name === e.target.value);
              if (found) setSelectedLoc(found);
            }}
            className="h-8 px-2.5 rounded bg-[#030d1d] border border-cyan-500/30 text-cyan-200 text-xs font-semibold focus:outline-none focus:border-cyan-400"
          >
            {locations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.lat.toFixed(1)}°N, {loc.lng.toFixed(1)}°E)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Flow Stepper Ribbon */}
      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#030a16] border border-cyan-500/20 text-xs overflow-x-auto">
        {[
          { id: 'parameters', label: '1. 7 Surface Instruments', sub: 'SST, SSS, SLA, Currents, Winds' },
          { id: 'convergence', label: '2. Ocean State Encoder', sub: 'Latent 64-D Latent Manifold' },
          { id: 'dive', label: '3. Vertical Sounding Dive', sub: '0–1000m Depth Layer Reveal' },
        ].map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setActiveStage(step.id as any)}
            className={`flex-1 min-w-[200px] p-2 rounded text-left transition-all cursor-pointer ${
              activeStage === step.id
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(24,191,239,0.25)]'
                : 'bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">{step.label}</span>
              <span className="text-[10px] text-slate-500">STAGE 0{idx + 1}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{step.sub}</p>
          </button>
        ))}
      </div>

      {/* Dynamic Stage Content */}
      {activeStage === 'parameters' && (
        <SurfaceParametersInstrument
          location={selectedLoc}
          observation={obs}
          onProceedToConvergence={() => setActiveStage('convergence')}
          onBackToGlobe={() => navigate('/dashboard')}
        />
      )}

      {activeStage === 'convergence' && (
        <OceanStateConvergence
          location={selectedLoc}
          observation={obs}
          onStartReconstruction={() => setActiveStage('dive')}
          onBackToParameters={() => setActiveStage('parameters')}
        />
      )}

      {activeStage === 'dive' && (
        <SubsurfaceReconstructionDive
          location={selectedLoc}
          onCompleteProfile={() => navigate('/profile')}
          onOpenXRay={() => navigate('/ocean-xray')}
          onBackToEncoder={() => setActiveStage('convergence')}
        />
      )}
    </div>
  );
}
