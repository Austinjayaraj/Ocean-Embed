import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Cpu, Clock, CheckCircle, ArrowDown } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import KpiCard from '../components/common/KpiCard';
import { systemHealthItems, systemTimeline } from '../data/mockData';

const serviceIcons: Record<string, React.ReactNode> = {
  'OceanEmbed Model': <Cpu size={16} />,
  'FastAPI Backend': <Server size={16} />,
  'Data Pipeline (n8n)': <Activity size={16} />,
  'PostgreSQL / PostGIS': <Database size={16} />,
  'GPU (CUDA)': <Cpu size={16} />,
  'React Frontend': <CheckCircle size={16} />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

const archSteps = [
  { label: 'Data Sources', sub: 'Copernicus · CMEMS · ERA5 · ARGO', color: '#18BFEF' },
  { label: 'n8n Orchestration', sub: 'Automated workflow scheduler', color: '#0866C6' },
  { label: 'Python / Xarray', sub: 'Preprocessing & regridding', color: '#45D6C8' },
  { label: 'FastAPI', sub: 'REST API for predictions', color: '#0866C6' },
  { label: 'PyTorch', sub: 'OceanEmbed encoder–decoder', color: '#18BFEF' },
  { label: 'PostgreSQL / PostGIS', sub: 'Geospatial storage', color: '#45D6C8' },
  { label: 'React / Three.js', sub: 'Dashboard & 3D visualization', color: '#22C55E' },
];

export default function System() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={20} className="text-[#22C55E]" />
          <h1 className="text-xl font-bold text-[#071B33]">System Health</h1>
        </div>
        <p className="text-sm text-gray-500">Real-time status of all OceanEmbed platform components.</p>
      </motion.div>

      {/* KPI row */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="Model Status" value="Operational" icon={<Cpu size={16} />} color="#22C55E" />
        <KpiCard title="API Status" value="Operational" icon={<Server size={16} />} color="#22C55E" />
        <KpiCard title="Last Model Run" value="06:11 UTC" icon={<Clock size={16} />} color="#0866C6" />
        <KpiCard title="Last Data Update" value="06:24 UTC" icon={<Clock size={16} />} color="#18BFEF" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Service health cards */}
        <div className="lg:col-span-2">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <SectionHeader title="Service Status" subtitle="All services checked 06:24 UTC" />
            <div className="space-y-2">
              {systemHealthItems.map((item, i) => (
                <motion.div
                  key={item.service}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#0866C6]">{serviceIcons[item.service]}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.service}</p>
                      <p className="text-xs text-gray-500">{item.details}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <StatusBadge status={item.status} />
                    <p className="text-xs text-gray-400 mt-0.5">Uptime: {item.uptime}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <SectionHeader title="System Timeline" subtitle="Today's pipeline events" />
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {systemTimeline.map((event, i) => (
                  <div key={i} className="flex gap-3 pl-1 relative">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10"
                      style={{ background: event.status === 'success' ? '#f0fdf4' : '#fef2f2', border: '2px solid', borderColor: event.status === 'success' ? '#22C55E' : '#EF4444' }}
                    >
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-mono text-gray-400">{event.time} UTC</p>
                      <p className="text-sm text-gray-700">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Architecture diagram */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-[#071B33] rounded-lg p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} className="text-[#18BFEF]" />
          <h3 className="text-sm font-semibold text-white">System Architecture</h3>
        </div>
        <div className="flex flex-col items-center gap-1">
          {archSteps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="w-full max-w-sm rounded-lg px-4 py-2.5 border text-center"
                style={{ borderColor: `${step.color}40`, background: `${step.color}12` }}
              >
                <p className="text-white text-sm font-semibold">{step.label}</p>
                <p className="text-gray-400 text-xs">{step.sub}</p>
              </div>
              {i < archSteps.length - 1 && (
                <ArrowDown size={16} className="text-gray-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
