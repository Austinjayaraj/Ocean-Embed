import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import {
  Activity, Server, Database, Cpu, Clock, CheckCircle
} from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import DemoBadge from '../components/common/DemoBadge';
import KpiCard from '../components/common/KpiCard';
import { systemHealthItems, systemTimeline } from '../data/mockData';

const NETWORK_NODES = [
  { id: 'data_sources', name: 'Data Feeds', pos: [-3.2, 1.2, 0], color: '#18BFEF', status: 'ONLINE' },
  { id: 'n8n', name: 'n8n Orchestrator', pos: [-1.6, 2.0, 0], color: '#F59E0B', status: 'READY' },
  { id: 'fastapi', name: 'FastAPI REST', pos: [-0.6, 0.4, 0], color: '#0866C6', status: 'ONLINE' },
  { id: 'pytorch', name: 'PyTorch GPU Model', pos: [1.2, 1.6, 0], color: '#A855F7', status: 'READY' },
  { id: 'postgis', name: 'PostGIS DB', pos: [2.6, -0.6, 0], color: '#10B981', status: 'ONLINE' },
  { id: 'frontend', name: 'React Frontend', pos: [-0.8, -1.8, 0], color: '#38BDF8', status: 'ONLINE' },
  { id: 'threejs', name: 'Three.js 3D Engine', pos: [1.4, -1.8, 0], color: '#45D6C8', status: 'ONLINE' },
];

const NETWORK_LINKS: [number, number][] = [
  [0, 1], // Data Feeds -> n8n
  [1, 2], // n8n -> FastAPI
  [2, 3], // FastAPI -> PyTorch
  [3, 4], // PyTorch -> PostGIS
  [4, 5], // PostGIS -> Frontend
  [2, 5], // FastAPI -> Frontend
  [5, 6], // Frontend -> Three.js
];

function NetworkNodeTopology({ onSelectNode }: { onSelectNode: (node: any) => void }) {
  const linePairs = useMemo(() => {
    return NETWORK_LINKS.map(([a, b]) => {
      return [
        new THREE.Vector3(...NETWORK_NODES[a].pos),
        new THREE.Vector3(...NETWORK_NODES[b].pos),
      ];
    });
  }, []);

  return (
    <group>
      {/* Network Links */}
      {linePairs.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color="#18BFEF"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {/* Network Nodes */}
      {NETWORK_NODES.map((node) => (
        <group key={node.id} position={new THREE.Vector3(...node.pos)}>
          <mesh
            onClick={() => onSelectNode(node)}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <sphereGeometry args={[0.24, 20, 20]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.28, 0.32, 24]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
            <span className="text-[10px] font-mono-tech text-white font-bold bg-[#030d1d]/85 px-1.5 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap shadow-sm">
              {node.name}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

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

export default function System() {
  const [selectedNode, setSelectedNode] = useState(NETWORK_NODES[3]);

  return (
    <div className="space-y-6 font-mono-tech">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#22C55E]" />
            <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display">
              System Health & Service Topology
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Real-time status of all OceanEmbed platform components, services, database connectivity, and 3D network nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KpiCard title="MODEL ENGINE" value="Operational" icon={<Cpu size={16} />} color="#22C55E" subtitle="PyTorch GPU runtime" />
        <KpiCard title="API GATEWAY" value="Operational" icon={<Server size={16} />} color="#22C55E" subtitle="FastAPI <50ms" />
        <KpiCard title="LAST INFERENCE" value="06:11 UTC" icon={<Clock size={16} />} color="#18BFEF" subtitle="Daily cycle" />
        <KpiCard title="CACHE DATABASE" value="Connected" icon={<Database size={16} />} color="#45D6C8" subtitle="PostGIS Spatial" />
      </motion.div>

      {/* 3D Network Topology Map */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="ocean-panel p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <SectionHeader
            title="3D Service Communication Network"
            subtitle="Interactive network topology. Click any node to inspect service health and inter-process communication."
          />
          <span className="text-[10px] text-cyan-400 uppercase font-bold">
            COMMUNICATION PING: &lt;1ms
          </span>
        </div>

        <div className="h-64 w-full relative rounded-lg bg-[#020612] overflow-hidden border border-cyan-500/20">
          <Canvas camera={{ position: [0, 0, 5.2], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 0, 4]} intensity={2} color="#18BFEF" />
            <NetworkNodeTopology onSelectNode={setSelectedNode} />
          </Canvas>

          {/* Active node detail pill */}
          <div className="absolute bottom-3 left-4 p-2 rounded-lg bg-[#040e20]/90 border border-cyan-500/30 text-xs text-white">
            <span className="text-[10px] text-slate-400 block">SELECTED SERVICE:</span>
            <span className="font-bold text-cyan-300">{selectedNode.name}</span>
            <span className="text-[10px] text-emerald-400 ml-2">● {selectedNode.status}</span>
          </div>
        </div>
      </motion.div>

      {/* Service Health Cards + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Service health cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <SectionHeader
            title="Active Platform Services"
            subtitle="Microservice uptime, health checks, and execution status"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systemHealthItems.map((item) => (
              <div
                key={item.service}
                className="ocean-panel p-3.5 hover:border-cyan-400/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                      {serviceIcons[item.service] ?? <Activity size={16} />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.service}</h4>
                      <span className="text-[10px] text-slate-400">Last check: {item.lastCheck}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed mt-1">
                  {item.details}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                  <span>Uptime: <strong className="text-emerald-400">{item.uptime}</strong></span>
                  <span>Health: Nominal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Log (4 Cols) */}
        <div className="lg:col-span-4 ocean-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-cyan-500/20 text-xs">
              <Clock size={14} className="text-cyan-400" />
              <h3 className="font-bold text-white uppercase tracking-wider">Execution Timeline</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
              {systemTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-mono-tech text-[10px] mt-0.5 whitespace-nowrap">
                    {item.time}
                  </span>
                  <div className="flex-1 pb-2 border-b border-slate-800/80">
                    <p className="text-slate-200 text-[11px] font-sans">{item.event}</p>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">SUCCESS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-500/15 text-[10px] text-slate-400">
            Automated health probes run every 60 seconds.
          </div>
        </div>
      </div>
    </div>
  );
}
