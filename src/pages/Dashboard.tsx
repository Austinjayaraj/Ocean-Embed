import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowDown, Layers, Anchor, Activity,
  Thermometer, Droplets, TrendingUp, Navigation, Wind,
  AlignVerticalDistributeCenter, ArrowRight, Fish, Globe,
  AlertTriangle, BarChart2,
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import SectionHeader from '../components/common/SectionHeader';
import DemoBadge from '../components/common/DemoBadge';
import Tooltip from '../components/common/Tooltip';
import OceanMap from '../components/ocean/OceanMap';
import TemperatureDepthChart from '../components/charts/TemperatureDepthChart';
import { oceanStateSummary, defaultProfile } from '../data/mockData';
import type { OceanLocation } from '../types/ocean';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const kpis = [
  { title: 'Surface Coverage', value: '0.25° × 0.25°', icon: <LayoutDashboard size={16} />, color: '#0866C6' },
  { title: 'Reconstruction Depth', value: '0–1000 m', icon: <ArrowDown size={16} />, color: '#18BFEF' },
  { title: 'Standard Depth Levels', value: '15', icon: <Layers size={16} />, color: '#45D6C8' },
  { title: 'Validation Source', value: 'ARGO', icon: <Anchor size={16} />, color: '#0866C6' },
  { title: 'Pipeline Status', value: 'Operational', icon: <Activity size={16} />, color: '#22C55E' },
];

const stateItems = [
  {
    key: 'sst', icon: <Thermometer size={18} />, color: '#EF4444',
    tooltip: 'Sea Surface Temperature — temperature of the ocean at the surface (~0.1m depth), measured by satellites.',
  },
  {
    key: 'sss', icon: <Droplets size={18} />, color: '#0866C6',
    tooltip: 'Sea Surface Salinity — concentration of dissolved salts in surface ocean water (PSU = Practical Salinity Units).',
  },
  {
    key: 'sla', icon: <TrendingUp size={18} />, color: '#18BFEF',
    tooltip: 'Sea Level Anomaly — deviation of sea surface height from the long-term mean, used to infer subsurface heat content.',
  },
  {
    key: 'currentSpeed', icon: <Navigation size={18} />, color: '#45D6C8',
    tooltip: 'Magnitude of the surface ocean current velocity vector (√(u² + v²)).',
  },
  {
    key: 'windSpeed', icon: <Wind size={18} />, color: '#9CA3AF',
    tooltip: 'Surface wind speed used to drive ocean mixing and derive wind stress.',
  },
  {
    key: 'thermoclineDepth', icon: <AlignVerticalDistributeCenter size={18} />, color: '#F59E0B',
    tooltip: 'Estimated depth of the thermocline — the layer where temperature decreases sharply with depth.',
  },
];

const whyItems = [
  { icon: <Globe size={15} />, text: 'Ocean monitoring & climate studies' },
  { icon: <Thermometer size={15} />, text: 'Marine heatwave detection & analysis' },
  { icon: <Fish size={15} />, text: 'Fisheries & ecosystem monitoring' },
  { icon: <AlertTriangle size={15} />, text: 'Hazard & decision-support systems' },
  { icon: <BarChart2 size={15} />, text: 'Seasonal & climate forecasting support' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [, setSelectedLoc] = React.useState<OceanLocation | null>(null);

  return (
    <div className="space-y-5">
      {/* ── Hero Header ───────────────────────────────────────── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B33 0%, #0A2A4A 60%, #0866C6 100%)' }}
      >
        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-bold bg-[#18BFEF]/20 text-[#18BFEF] rounded border border-[#18BFEF]/30 uppercase tracking-widest">
                SIH 2026 · Problem SIH26066
              </span>
              <DemoBadge />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mt-2">OCEANEMBED</h1>
            <p className="text-[#45D6C8] font-semibold text-base">Subsurface Ocean Intelligence</p>
            <p className="text-white/60 text-sm mt-1 max-w-lg">
              From sparse surface observations to a reconstructed view of the hidden ocean — using AI-driven ocean embeddings.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/explorer')}
              className="flex items-center gap-2 bg-[#0866C6] hover:bg-[#065bb0] text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            >
              Explore Ocean State <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/ocean-xray')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm border border-white/20"
            >
              Open 3D Ocean X-Ray <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Pipeline ribbon */}
        <div className="border-t border-white/10 px-5 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { label: 'Surface Obs.', sub: 'SST · SSS · SLA · Currents · Wind', active: true },
              { label: 'Ocean Encoder', sub: 'Multi-variable fusion', active: false },
              { label: 'Embedding', sub: '64-dim latent state', active: false },
              { label: 'Depth Decoder', sub: 'Profile reconstruction', active: false },
              { label: 'Subsurface Temp', sub: '0–1000m · 15 depths', active: false },
              { label: 'ARGO Validation', sub: 'Independent check', active: false },
              { label: 'Ocean Intelligence', sub: 'Anomaly · Monitoring', active: true },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className={`flex-shrink-0 px-3 py-1.5 rounded text-center ${step.active ? 'bg-[#0866C6]/40 border border-[#18BFEF]/40' : 'bg-white/5 border border-white/10'}`}>
                  <p className="text-white text-xs font-semibold whitespace-nowrap">{step.label}</p>
                  <p className="text-white/40 text-xs whitespace-nowrap">{step.sub}</p>
                </div>
                {i < arr.length - 1 && <span className="text-[#18BFEF] flex-shrink-0 text-sm">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {kpis.map((k, i) => (
          <KpiCard key={i} title={k.title} value={k.value} icon={k.icon} color={k.color} />
        ))}
      </motion.div>

      {/* ── Main Map ──────────────────────────────────────────── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <SectionHeader
            title="North Indian Ocean — Interactive Map"
            subtitle="Click any observation point. Anomaly regions highlighted in orange/red."
          />
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-1.5 text-xs text-[#0866C6] hover:text-[#065bb0] font-medium"
          >
            Open Explorer <ArrowRight size={12} />
          </button>
        </div>
        <OceanMap
          onLocationSelect={setSelectedLoc}
          showArgo={true}
          showAnomalies={true}
          className="rounded overflow-hidden"
          style={{ height: 320 }}
        />
      </motion.div>

      {/* ── Ocean State + Temperature ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <SectionHeader title="Ocean State Summary" subtitle="Bay of Bengal – Central, 18 Sep 2026">
            <DemoBadge />
          </SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            {stateItems.map(({ key, icon, color, tooltip }) => {
              const item = oceanStateSummary[key as keyof typeof oceanStateSummary];
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span style={{ color }} className="flex-shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <Tooltip text={tooltip}>
                      <span className="text-xs text-gray-500 uppercase tracking-wide cursor-help underline decoration-dotted">
                        {item.abbr}
                      </span>
                    </Tooltip>
                    <p className="text-sm font-bold text-gray-800">
                      {key === 'sla' && item.value > 0 ? '+' : ''}{item.value}
                      <span className="text-xs font-normal text-gray-500 ml-1">{item.unit}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => navigate('/explorer')}
              className="w-full flex items-center justify-center gap-2 bg-[#0866C6] hover:bg-[#065bb0] text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              Reconstruct Hidden Ocean <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <SectionHeader title="Subsurface Temperature Snapshot" subtitle="Reconstructed 0–1000m profile · Bay of Bengal – Central">
            <DemoBadge />
          </SectionHeader>
          <TemperatureDepthChart data={defaultProfile.depths} height={260} />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Illustrative profile. Blue = predicted · Cyan dashed = ARGO reference
          </p>
        </motion.div>
      </div>

      {/* ── Why OceanEmbed ────────────────────────────────────── */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#18BFEF] rounded-full" />
            <h3 className="text-sm font-bold text-[#071B33]">Why OceanEmbed?</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Surface observations are globally abundant, but <strong>subsurface measurements are spatially sparse</strong>.
            OceanEmbed is designed to reconstruct the hidden thermal structure of the ocean from surface-only inputs —
            providing dense subsurface intelligence to support:
          </p>
          <div className="space-y-2">
            {whyItems.map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-[#0866C6] flex-shrink-0">{icon}</span>
                {text}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-amber-700 bg-amber-50 rounded p-2">
            <strong>Important:</strong> OceanEmbed provides ocean-state information that can
            support downstream monitoring and decision-support workflows. It is not a standalone disaster
            prediction system.
          </div>
        </div>

        <div className="bg-[#071B33] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#45D6C8] rounded-full" />
            <h3 className="text-sm font-bold text-white">Demo Flow — Judge Guide</h3>
          </div>
          <div className="space-y-2">
            {[
              { step: 1, label: 'Overview Dashboard', action: 'Surface observations', nav: '/dashboard' },
              { step: 2, label: 'Ocean Explorer', action: 'Select Bay of Bengal', nav: '/explorer' },
              { step: 3, label: 'Temperature Profile', action: 'Reconstruct 0–1000m', nav: '/profile' },
              { step: 4, label: '3D Ocean X-Ray', action: 'Move depth slider 0→1000m', nav: '/ocean-xray' },
              { step: 5, label: 'ARGO Validation', action: 'Predicted vs. independent', nav: '/validation' },
              { step: 6, label: 'Anomaly Intelligence', action: 'Subsurface anomaly map', nav: '/anomalies' },
            ].map(({ step, label, action, nav }) => (
              <button
                key={step}
                onClick={() => navigate(nav)}
                className="w-full flex items-center gap-3 text-left hover:bg-white/5 rounded px-2 py-1.5 transition-colors group"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0866C6]/50 text-[#18BFEF] text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-white text-xs font-semibold block">{label}</span>
                  <span className="text-gray-500 text-xs">{action}</span>
                </div>
                <ArrowRight size={12} className="text-gray-600 group-hover:text-[#18BFEF] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Global disclaimer ─────────────────────────────────── */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
        className="text-xs text-gray-400 text-center py-2"
      >
        DEMO MODE — Displayed predictions, metrics and anomalies are illustrative mock values for prototype demonstration
        and do not represent live ocean measurements.
      </motion.div>
    </div>
  );
}
