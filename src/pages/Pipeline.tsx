import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, CheckCircle, Download, ShieldCheck, Cpu, HardDrive,
  RefreshCw, LayoutDashboard, Globe, Radio, Clock
} from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
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

const ARCH_STAGES = [
  {
    id: 'sources',
    name: 'DATA SOURCES',
    sub: 'Copernicus · CMEMS · ERA5 · ARGO',
    tech: 'Satellite & Reanalysis Ingestion',
    color: '#18BFEF',
    latency: '06:00 UTC (4m 12s)',
    details: 'Automated ingestion of daily SST, SSS, SLA, surface currents, and ERA5 10m wind stress vectors across the North Indian Ocean.',
    stats: '1.2M Grid Points / day',
  },
  {
    id: 'n8n',
    name: 'n8n ORCHESTRATION',
    sub: 'Workflow Automation & Event Scheduling',
    tech: 'n8n Webhook / Cron Engine',
    color: '#F59E0B',
    latency: '06:05 UTC (1m 30s)',
    details: 'Coordinates fetch → validation → model inference pipeline. Retries on API timeouts and monitors source availability.',
    stats: '100% Pipeline Reliability',
  },
  {
    id: 'xarray',
    name: 'PYTHON / XARRAY',
    sub: 'Preprocessing & Spatial Alignment',
    tech: 'Xarray + NumPy + NetCDF4',
    color: '#45D6C8',
    latency: '06:07 UTC (3m 45s)',
    details: 'Regrids diverse native satellite resolutions to a uniform 0.25° × 0.25° grid. Handles land masking and missing value imputation.',
    stats: '0.25° Spatial Grid',
  },
  {
    id: 'fastapi',
    name: 'FASTAPI BACKEND',
    sub: 'Asynchronous Prediction Services',
    tech: 'Python 3.11 + Pydantic v2',
    color: '#0866C6',
    latency: '06:11 UTC (<50ms API)',
    details: 'Exposes high-performance RESTful inference endpoints with Pydantic schema validation and GPU inference dispatch.',
    stats: 'REST / OpenAPI 3.1',
  },
  {
    id: 'pytorch',
    name: 'PYTORCH INFERENCE',
    sub: 'OceanEmbed Encoder–Decoder',
    tech: 'PyTorch 2.4 + CUDA Acceleration',
    color: '#A855F7',
    latency: '06:19 UTC (8m 20s)',
    details: 'Fuses 7 surface inputs into a 64-dimensional latent ocean embedding, then decodes continuous 0–1000m thermal fields across 15 depths.',
    stats: '64-dim Latent Manifold',
  },
  {
    id: 'postgis',
    name: 'POSTGRESQL / POSTGIS',
    sub: 'Spatial & Historical Storage',
    tech: 'PostGIS Spatial Engine',
    color: '#10B981',
    latency: '06:23 UTC (1m 05s)',
    details: 'Stores vertical temperature columns, calculated thermal anomalies, and validation match-up metrics for historical retrieval.',
    stats: 'Spatial Indexing Enabled',
  },
  {
    id: 'dashboard',
    name: 'THREE.JS DASHBOARD',
    sub: 'Real-Time 3D Digital Twin',
    tech: 'React Three Fiber + WebGL',
    color: '#18BFEF',
    latency: '06:24 UTC (<16ms 60fps)',
    details: 'Renders the realistic Earth satellite twin, volumetric 3D ocean X-Ray, and depth-stratified thermal contours.',
    stats: '60 FPS Hardware Accelerated',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

// Canvas Flowing Data Packets Animation
function FlowingDataPacketCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle horizontal data vector line
      const centerY = h / 2;
      ctx.beginPath();
      ctx.moveTo(30, centerY);
      ctx.lineTo(w - 30, centerY);
      ctx.strokeStyle = 'rgba(24, 191, 239, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Flowing glowing packets along the vector line
      t += 0.015;
      const packetCount = 8;
      for (let i = 0; i < packetCount; i++) {
        const progress = (t + i / packetCount) % 1.0;
        const x = 30 + progress * (w - 60);
        const y = centerY + Math.sin(progress * Math.PI * 4) * 8;

        // Glowing packet dot
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#18BFEF';
        ctx.shadowColor = '#18BFEF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={32}
      className="w-full h-8 opacity-80"
    />
  );
}

export default function Pipeline() {
  const [selectedStage, setSelectedStage] = useState(ARCH_STAGES[4]); // PyTorch default

  return (
    <div className="space-y-6 font-mono-tech">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <GitBranch size={20} className="text-[#18BFEF]" />
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              End-to-End Data Pipeline Architecture
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1 max-w-3xl">
            Autonomous multi-stage data orchestration: from satellite ingestion (Copernicus/CMEMS/ERA5) through
            n8n workflows, Xarray preprocessing, PyTorch GPU inference, and PostGIS storage.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CYCLE OPERATIONAL (06:24 UTC)
          </span>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="DAILY DATA INGESTION" value="1.2M Pts" icon={<Download size={16} />} color="#18BFEF" />
        <KpiCard title="CYCLE DURATION" value="24m 12s" icon={<Clock size={16} />} color="#45D6C8" />
        <KpiCard title="MODEL INFERENCE" value="8m 20s" icon={<Cpu size={16} />} color="#A855F7" />
        <KpiCard title="DATA SOURCES" value="7 Feeds" icon={<Globe size={16} />} color="#F59E0B" />
      </motion.div>

      {/* Living 3D Data Flow Vector Track */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <SectionHeader
            title="Living System Flow Track"
            subtitle="Click any stage to inspect technical specs, schemas, and execution latency"
          />
          <span className="text-[10px] text-cyan-400 uppercase font-bold">
            PACKET STREAM: ACTIVE
          </span>
        </div>

        <FlowingDataPacketCanvas />

        {/* Stage Nodes Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
          {ARCH_STAGES.map((stage, idx) => {
            const isSelected = selectedStage.id === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'ocean-panel-glow border-cyan-400/60 scale-[1.02]'
                    : 'bg-[#040e20]/70 border border-slate-800 hover:border-cyan-500/40'
                }`}
                style={{ borderTop: `3px solid ${stage.color}` }}
              >
                <span className="text-[10px] text-slate-400 block font-bold">STEP 0{idx + 1}</span>
                <span className="text-xs font-bold text-white block mt-0.5 truncate">{stage.name}</span>
                <span className="text-[10px] text-cyan-300 block truncate mt-1">{stage.sub.split('·')[0]}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Stage Dossier & Data Sources Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Selected Stage Detail Inspector (5 Cols) */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-5 ocean-panel p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={14} className="text-cyan-400" /> Stage Telemetry
              </span>
              <StatusBadge status="operational" label="Healthy" />
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-white" style={{ color: selectedStage.color }}>
                {selectedStage.name}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{selectedStage.tech}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">EXECUTION LATENCY</span>
                <span className="text-xs font-bold text-white">{selectedStage.latency}</span>
              </div>
              <div className="p-2.5 rounded bg-[#040e20]/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">THROUGHPUT</span>
                <span className="text-xs font-bold text-cyan-300">{selectedStage.stats}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <p>{selectedStage.details}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/15 text-[11px] text-slate-400">
            Automated retry: Enabled · Webhook trigger: Active
          </div>
        </motion.div>

        {/* Input Data Sources (7 Cols) */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-7 ocean-panel p-5"
        >
          <SectionHeader
            title="External Ocean Data Feeds"
            subtitle="Multi-source satellite and in-situ feeds driving model predictions"
          />
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {dataSources.map((ds) => (
              <div
                key={ds.dataset}
                className="p-2.5 rounded-lg bg-[#040e20]/70 border border-slate-800 hover:border-cyan-500/30 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ds.dataset}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-cyan-300">
                      {ds.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{ds.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <StatusBadge status={ds.status} />
                  <span className="text-[10px] text-slate-400 block mt-1">{ds.lastUpdate}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Chronological Pipeline Step Runs */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <SectionHeader
          title="Daily Execution Cycle Log (06:00–06:24 UTC)"
          subtitle="Step-by-step verification of daily ocean reconstruction job"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineSteps.map((step, i) => (
            <div
              key={step.id}
              className="p-3 rounded-lg bg-[#040e20]/60 border border-slate-800 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400">STEP 0{step.id}</span>
                <StatusBadge status={step.status} />
              </div>
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <span className="text-cyan-400">{stepIcons[i % stepIcons.length]}</span>
                <span>{step.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug font-sans mb-2">
                {step.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                <span>Ran: {step.lastRun}</span>
                <span className="text-cyan-300 font-semibold">{step.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
