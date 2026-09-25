import React from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, CheckCircle,
  Download, ShieldCheck, Cpu, HardDrive, RefreshCw, LayoutDashboard,
  ArrowDown, Database, Server, Zap, Globe
} from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import { pipelineSteps, dataSources } from '../data/mockData';

const stepIcons: React.ReactNode[] = [
  <Download size={16} />,
  <ShieldCheck size={16} />,
  <RefreshCw size={16} />,
  <Cpu size={16} />,
  <CheckCircle size={16} />,
  <HardDrive size={16} />,
  <LayoutDashboard size={16} />,
];

function statusBorderColor(s: string): string {
  switch (s) {
    case 'operational': return '#22C55E';
    case 'warning': return '#F59E0B';
    case 'error': return '#EF4444';
    default: return '#9CA3AF';
  }
}

function statusBg(s: string): string {
  switch (s) {
    case 'operational': return 'bg-green-50';
    case 'warning': return 'bg-amber-50';
    case 'error': return 'bg-red-50';
    default: return 'bg-gray-50';
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

// Vertical n8n architecture diagram data
const N8N_ARCH = [
  {
    icon: <Globe size={16} />,
    label: 'Data Sources',
    sub: 'Copernicus · CMEMS · ERA5 · ARGO',
    color: '#18BFEF',
    role: 'Satellite & reanalysis data providers',
  },
  {
    icon: <Zap size={16} />,
    label: 'n8n Orchestration',
    sub: 'Workflow automation & scheduling',
    color: '#F59E0B',
    role: 'n8n = open-source workflow automation platform. Orchestrates fetch → validate → process → infer.',
  },
  {
    icon: <RefreshCw size={16} />,
    label: 'Python / Xarray',
    sub: 'Preprocessing & regridding',
    color: '#45D6C8',
    role: 'Xarray handles multi-dimensional ocean data (netCDF). Regrid, normalize, align all sources.',
  },
  {
    icon: <Server size={16} />,
    label: 'FastAPI',
    sub: 'Model serving REST API',
    color: '#0866C6',
    role: 'FastAPI wraps the PyTorch model as a REST endpoint — receives surface obs, returns subsurface profiles.',
  },
  {
    icon: <Cpu size={16} />,
    label: 'PyTorch (OceanEmbed)',
    sub: 'AI encoder–decoder inference',
    color: '#0866C6',
    role: 'The core AI model: multi-input encoder → 64-dim embedding → depth-aware decoder → 0–1000m temperature.',
  },
  {
    icon: <Database size={16} />,
    label: 'PostgreSQL / PostGIS',
    sub: 'Geospatial result storage',
    color: '#45D6C8',
    role: 'Stores predictions, anomaly maps, ARGO comparisons with full geospatial indexing.',
  },
  {
    icon: <LayoutDashboard size={16} />,
    label: 'React / Three.js Dashboard',
    sub: 'Visualization & 3D rendering',
    color: '#22C55E',
    role: 'This dashboard. Real-time visualization of predictions, anomalies, ARGO validation, and 3D ocean X-ray.',
  },
];

export default function Pipeline() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch size={20} className="text-[#0866C6]" />
          <h1 className="text-xl font-bold text-[#071B33]">Automated Ocean Data Pipeline</h1>
        </div>
        <p className="text-sm text-gray-500">
          End-to-end n8n-orchestrated pipeline: satellite ingestion → preprocessing → OceanEmbed inference →
          ARGO validation → dashboard update. Runs daily at 06:00 UTC.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: vertical n8n architecture */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-[#071B33] rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-white">n8n Pipeline Architecture</h3>
          </div>
          <div className="flex flex-col items-center gap-0">
            {N8N_ARCH.map((node, i) => (
              <React.Fragment key={node.label}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="w-full rounded-lg px-3 py-2.5 border flex items-start gap-3"
                  style={{ borderColor: `${node.color}40`, background: `${node.color}10` }}
                >
                  <span style={{ color: node.color }} className="flex-shrink-0 mt-0.5">{node.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold">{node.label}</p>
                    <p className="text-gray-400 text-xs">{node.sub}</p>
                    <p className="text-gray-600 text-xs mt-0.5 italic">{node.role}</p>
                  </div>
                </motion.div>
                {i < N8N_ARCH.length - 1 && (
                  <ArrowDown size={14} className="text-gray-700 my-0.5 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Right: step cards */}
        <div className="space-y-3">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <SectionHeader title="Pipeline Steps" subtitle="Daily execution — 06:00 UTC" />
            <div className="space-y-2">
              {pipelineSteps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className={`rounded-lg border-l-4 p-3 ${statusBg(step.status)}`}
                  style={{ borderLeftColor: statusBorderColor(step.status) }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color: statusBorderColor(step.status) }}>{stepIcons[i]}</span>
                      <span className="text-sm font-semibold text-gray-800">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{step.duration}</span>
                      <StatusBadge status={step.status} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{step.description}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5 ml-6">{step.lastRun}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Data Sources table */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <SectionHeader title="Data Sources" subtitle="Multi-source satellite and reanalysis inputs" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Dataset', 'Source', 'Status', 'Last Update', 'Records', 'Description'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataSources.map((ds, i) => (
                <tr key={i} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-3 py-2 font-semibold text-gray-800 text-sm">{ds.dataset}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">{ds.source}</span>
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={ds.status} /></td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{ds.lastUpdate}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{ds.records}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{ds.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Tech stack tags */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
      >
        <SectionHeader title="Technology Stack" subtitle="End-to-end production architecture" />
        <div className="flex flex-wrap gap-2">
          {['Python', 'Xarray', 'PyTorch', 'n8n', 'FastAPI', 'PostgreSQL', 'PostGIS', 'Docker', 'React', 'Three.js', 'Copernicus API', 'CMEMS', 'ERA5', 'ARGO'].map(t => (
            <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
