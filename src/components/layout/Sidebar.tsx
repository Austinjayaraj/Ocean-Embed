import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Waves,
  Globe,
  Thermometer,
  Box,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Activity,
  Menu,
  X,
  Radio,
  Cpu,
  Compass,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "GLOBAL VIEW", path: "/dashboard", code: "01", icon: Globe },
  { label: "EXPLORER", path: "/explorer", code: "02", icon: Compass },
  { label: "SURFACE DATA", path: "/surface-data", code: "03", icon: Layers },
  { label: "PROFILE", path: "/profile", code: "04", icon: Thermometer },
  { label: "OCEAN X-RAY", path: "/ocean-xray", code: "05", icon: Box },
  { label: "ANOMALIES", path: "/anomalies", code: "06", icon: AlertTriangle },
  { label: "VALIDATION", path: "/validation", code: "07", icon: CheckCircle },
  { label: "PIPELINE", path: "/pipeline", code: "08", icon: GitBranch },
  { label: "SYSTEM", path: "/system", code: "09", icon: Activity },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 lg:hidden rounded-lg bg-[#071527] border border-cyan-500/30 p-2 text-cyan-300 shadow-xl"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile slide-in sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#030a16] border-r border-cyan-500/20 text-white lg:hidden shadow-2xl"
          >
            <SidebarContent onNavClick={onToggle} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#030a16] border-r border-cyan-500/15 text-white shrink-0 relative z-30">
        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const [timeUtc, setTimeUtc] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0866C6] to-[#18BFEF] flex items-center justify-center shadow-[0_0_15px_rgba(24,191,239,0.5)]">
            <Waves size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-wider text-white font-display flex items-center gap-1.5">
              OCEANEMBED
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-400 tracking-widest block uppercase font-medium">
              Subsurface Intelligence
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-2 py-1 rounded bg-[#07182e] border border-cyan-500/20 text-[10px] font-mono-tech">
          <span className="text-slate-400 flex items-center gap-1">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            TELEMETRY
          </span>
          <span className="text-cyan-300 font-bold">{timeUtc || "06:24:00 UTC"}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-3 flex-1 space-y-1 px-3 overflow-y-auto font-mono-tech">
        <p className="px-3 py-1 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Mission Modules
        </p>
        {navItems.map(({ label, path, code, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavClick}
            className={({ isActive }) =>
              [
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-all group",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-200 border-l-[3px] border-[#18BFEF] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent font-medium",
              ].join(" ")
            }
          >
            <div className="flex items-center gap-2.5">
              <Icon size={16} className="text-[#18BFEF] group-hover:text-cyan-300 transition-colors" />
              <span>{label}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono-tech group-hover:text-cyan-400/80">
              {code}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Telemetry & Platform Specs */}
      <div className="border-t border-cyan-500/15 p-4 bg-[#020710] font-mono-tech text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Core Model:</span>
          <span className="text-cyan-300 font-semibold">OceanEmbed-v1</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Inference Core:</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Cpu size={11} /> CUDA Ready
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Resolution:</span>
          <span className="text-white">0.25° · 0–1000m</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-amber-400/90 font-bold">DEMO PROTOTYPE</span>
          <span className="text-slate-500">SIH 2026</span>
        </div>
      </div>
    </div>
  );
}
