import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Info, CheckCircle, Cpu, Layers, Zap } from 'lucide-react';
import OceanMap from '../components/ocean/OceanMap';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import Tooltip from '../components/common/Tooltip';
import DemoBadge from '../components/common/DemoBadge';
import { locations, getOceanObservation } from '../data/mockData';
import type { OceanLocation, OceanVariable, Region } from '../types/ocean';

const VARIABLES: OceanVariable[] = ['SST', 'SSS', 'SLA', 'U Current', 'V Current', 'Wind U', 'Wind V', 'Predicted Temperature', 'Uncertainty', 'Anomaly'];
const REGIONS: Region[] = ['North Indian Ocean', 'Arabian Sea', 'Bay of Bengal'];
const DEPTHS = [0, 50, 100, 200, 300, 500, 700, 1000];

// ── Animated pipeline steps ──────────────────────────────────────
const PIPELINE_STEPS = [
  { id: 0, label: 'Surface Observations', sub: 'SST · SSS · SLA · Currents · Wind', color: '#18BFEF' },
  { id: 1, label: 'Preprocessing', sub: 'Regrid · Normalize · Align', color: '#45D6C8' },
  { id: 2, label: 'Ocean Encoder', sub: 'Multi-source fusion layer', color: '#0866C6' },
  { id: 3, label: 'Ocean Embedding', sub: '64-dim hidden state', color: '#45D6C8' },
  { id: 4, label: 'Depth Decoder', sub: 'Depth-conditioned decoding', color: '#0866C6' },
  { id: 5, label: 'Temperature Profile', sub: '0–1000m · 15 standard depths', color: '#22C55E' },
];

function EmbeddingFlow({ active }: { active: boolean }) {
  return (
    <div className="bg-[#071B33] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={14} className="text-[#18BFEF]" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">OceanEmbed Architecture</h3>
        <span className="text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">Prototype</span>
      </div>

      {/* Surface variables */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Surface Inputs</p>
        <div className="flex flex-wrap gap-1">
          {['SST', 'SSS', 'SLA', 'U curr.', 'V curr.', 'Wind U', 'Wind V'].map((v, i) => (
            <motion.span
              key={v}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: active ? 1 : 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="px-2 py-0.5 text-xs font-mono rounded border"
              style={{ color: '#18BFEF', borderColor: '#18BFEF40', background: '#18BFEF12' }}
            >
              {v}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 my-2">
        {['Ocean Encoder', 'Ocean Embedding', 'Depth Decoder'].map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-0.5 w-full">
            <motion.div
              initial={{ opacity: 0.3, scale: 0.97 }}
              animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.97 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
              className="w-full text-center py-1.5 rounded border text-xs font-semibold"
              style={
                i === 1
                  ? { background: '#0866C620', borderColor: '#45D6C860', color: '#45D6C8' }
                  : { background: '#0866C610', borderColor: '#0866C640', color: '#18BFEF' }
              }
            >
              {step}
              {i === 1 && <span className="text-xs text-gray-500 font-normal ml-1">(64-dim)</span>}
            </motion.div>
            {i < 2 && <div className="w-0.5 h-3 bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Output */}
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-1 text-center py-1.5 rounded border border-green-500/40 bg-green-500/10 text-xs font-semibold text-green-400"
      >
        Subsurface Temperature 0–1000m
      </motion.div>
      <p className="text-xs text-gray-600 text-center mt-1.5">Prototype embedding representation</p>
    </div>
  );
}

function ReconstructionAnimator({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  // auto-advance
  useState(() => {
    const advance = (s: number) => {
      if (s < PIPELINE_STEPS.length - 1) {
        setTimeout(() => {
          setStep(s + 1);
          advance(s + 1);
        }, 500);
      } else {
        setTimeout(onDone, 600);
      }
    };
    advance(0);
  });

  return (
    <div className="space-y-2">
      {PIPELINE_STEPS.map((ps, i) => (
        <motion.div
          key={ps.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: i <= step ? 1 : 0.25, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="flex items-center gap-3 p-2.5 rounded-lg border"
          style={{
            borderColor: i <= step ? `${ps.color}40` : '#ffffff10',
            background: i === step ? `${ps.color}15` : 'transparent',
          }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: i <= step ? `${ps.color}30` : '#ffffff08' }}
          >
            {i < step
              ? <CheckCircle size={12} style={{ color: ps.color }} />
              : i === step
                ? <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Zap size={11} style={{ color: ps.color }} />
                  </motion.div>
                : <span className="text-gray-600 text-xs font-mono">{i + 1}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white">{ps.label}</p>
            <p className="text-xs text-gray-500">{ps.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Explorer() {
  const navigate = useNavigate();
  const [selectedLoc, setSelectedLoc] = useState<OceanLocation>(locations[0]);
  const [region, setRegion] = useState<Region>('Bay of Bengal');
  const [lat, setLat] = useState('12.0');
  const [lng, setLng] = useState('85.0');
  const [date] = useState('2026-09-18');
  const [depth, setDepth] = useState(0);
  const [variable, setVariable] = useState<OceanVariable>('SST');
  const [reconstructing, setReconstructing] = useState(false);
  const [reconstructed, setReconstructed] = useState(false);

  const obs = getOceanObservation(selectedLoc, date);

  function handleLocSelect(loc: OceanLocation) {
    setSelectedLoc(loc);
    setLat(loc.lat.toFixed(1));
    setLng(loc.lng.toFixed(1));
    setRegion(loc.region);
    setReconstructed(false);
  }

  function startReconstruction() {
    setReconstructing(true);
    setReconstructed(false);
  }

  function handleReconstructionDone() {
    setReconstructing(false);
    setReconstructed(true);
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <SectionHeader title="Ocean Explorer" subtitle="Select a location to explore surface observations and initiate subsurface reconstruction." />
          <DemoBadge />
        </div>
      </motion.div>

      {/* Controls bar */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Region</label>
            <select value={region} onChange={e => setRegion(e.target.value as Region)}
              className="h-8 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Latitude (°N)</label>
            <input type="number" step="0.1" value={lat} onChange={e => setLat(e.target.value)}
              className="h-8 w-24 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Longitude (°E)</label>
            <input type="number" step="0.1" value={lng} onChange={e => setLng(e.target.value)}
              className="h-8 w-24 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Date</label>
            <input type="date" defaultValue={date}
              className="h-8 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Depth (m)</label>
            <select value={depth} onChange={e => setDepth(Number(e.target.value))}
              className="h-8 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DEPTHS.map(d => <option key={d} value={d}>{d} m</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Variable</label>
            <select value={variable} onChange={e => setVariable(e.target.value as OceanVariable)}
              className="h-8 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {VARIABLES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Map + Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Interactive Ocean Map" subtitle={`Variable: ${variable} · Depth: ${depth}m`} />
          </div>
          <OceanMap
            onLocationSelect={handleLocSelect}
            selectedLocation={selectedLoc}
            showArgo={true}
            showAnomalies={true}
            style={{ height: 360 }}
          />
        </div>

        {/* Right info panel */}
        <div className="space-y-3">
          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-[#0866C6]" />
              <h3 className="text-sm font-semibold text-gray-800">Selected Location</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              {[
                { label: 'Latitude', value: `${selectedLoc.lat.toFixed(1)}° N` },
                { label: 'Longitude', value: `${selectedLoc.lng.toFixed(1)}° E` },
                { label: 'Date', value: '18 Sep 2026' },
                { label: 'Region', value: selectedLoc.region },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-mono font-semibold ${label === 'Region' ? 'text-[#0866C6] text-xs' : 'text-gray-800'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Surface observations */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Surface Observations</h3>
              <DemoBadge />
            </div>
            <div className="space-y-2">
              {[
                { label: 'SST', tooltip: 'Sea Surface Temperature', value: `${obs.sst} °C`, color: '#EF4444' },
                { label: 'SSS', tooltip: 'Sea Surface Salinity', value: `${obs.sss} PSU`, color: '#0866C6' },
                { label: 'SLA', tooltip: 'Sea Level Anomaly', value: `${obs.sla > 0 ? '+' : ''}${obs.sla} m`, color: '#18BFEF' },
                { label: 'U Current', tooltip: 'Zonal current velocity', value: `${obs.uCurrent} m/s`, color: '#45D6C8' },
                { label: 'V Current', tooltip: 'Meridional current velocity', value: `${obs.vCurrent} m/s`, color: '#45D6C8' },
                { label: 'Wind', tooltip: 'Surface wind speed', value: `${obs.windSpeed} m/s`, color: '#9CA3AF' },
              ].map(({ label, tooltip, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <Tooltip text={tooltip}>
                    <span className="text-xs text-gray-500 uppercase tracking-wide cursor-help underline decoration-dotted">{label}</span>
                  </Tooltip>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Embedding panel + CTA */}
          <div className="bg-[#071B33] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-[#18BFEF]" />
              <h3 className="text-sm font-semibold text-white">Ocean Embedding Status</h3>
            </div>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Embedding Dimension</span>
                <span className="text-[#45D6C8] font-bold">64 <span className="text-gray-600 text-xs">(prototype)</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Completeness</span>
                <span className="text-[#45D6C8] font-bold">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Prediction Status</span>
                <StatusBadge status="operational" label="Available" />
              </div>
            </div>

            <Tooltip text="Ocean Embedding: A learned 64-dim representation of the hidden ocean state, derived from surface observations.">
              <span className="text-xs text-gray-500 underline decoration-dotted cursor-help block mb-3">What is Ocean Embedding?</span>
            </Tooltip>

            <AnimatePresence mode="wait">
              {!reconstructing && !reconstructed && (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={startReconstruction}
                  className="w-full flex items-center justify-center gap-2 bg-[#0866C6] hover:bg-[#065bb0] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Layers size={14} /> Reconstruct Subsurface Profile
                </motion.button>
              )}

              {reconstructing && (
                <motion.div key="animating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-xs text-[#18BFEF] font-semibold mb-2 flex items-center gap-1">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Zap size={12} />
                    </motion.div>
                    Running OceanEmbed…
                  </div>
                  <ReconstructionAnimator onDone={handleReconstructionDone} />
                </motion.div>
              )}

              {reconstructed && (
                <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Profile reconstructed</span>
                    <DemoBadge />
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    View Temperature Profile <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate('/ocean-xray')}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-white/10"
                  >
                    Open 3D Ocean X-Ray <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Embedding architecture panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <EmbeddingFlow active={reconstructed || reconstructing} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <SectionHeader title="Surface → Subsurface Transformation" subtitle="How OceanEmbed derives hidden ocean state from surface observations" />
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-blue-500 font-bold text-xs uppercase tracking-wide mt-0.5 flex-shrink-0">Problem</span>
              <p className="text-xs leading-relaxed">Subsurface ocean observations (temperature, salinity) are expensive and spatially sparse.
                Only ~4,000 ARGO floats cover the global ocean. Direct measurement of 0–1000m profiles is impractical at scale.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-green-600 font-bold text-xs uppercase tracking-wide mt-0.5 flex-shrink-0">Solution</span>
              <p className="text-xs leading-relaxed">OceanEmbed encodes 7 satellite surface variables (SST, SSS, SLA, U/V currents, wind)
                into a compact 64-dimensional embedding representing the <em>hidden ocean state</em>,
                then decodes depth-conditioned temperature profiles at 15 standard levels to 1000m.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-wide mt-0.5 flex-shrink-0">Training</span>
              <p className="text-xs leading-relaxed">Model is trained against GLORYS reanalysis (training target).
                Evaluated independently against held-out ARGO float profiles (not used in training).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
