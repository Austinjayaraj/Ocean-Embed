import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Globe, Compass, Layers, Thermometer, Box, AlertTriangle,
  CheckCircle, GitBranch, Activity, Menu, X, Calendar, Radio
} from "lucide-react";
import DemoBadge from "../common/DemoBadge";

const navModules = [
  { label: "GLOBAL VIEW", path: "/dashboard", code: "01", icon: Globe, desc: "Satellite Earth Digital Twin" },
  { label: "EXPLORER", path: "/explorer", code: "02", icon: Compass, desc: "0.25° Coordinate Observation Console" },
  { label: "SURFACE DATA", path: "/surface-data", code: "03", icon: Layers, desc: "7-Channel Satellite Boundary Inputs" },
  { label: "PROFILE", path: "/profile", code: "04", icon: Thermometer, desc: "0–1000m Subsurface Thermal Structure" },
  { label: "OCEAN X-RAY", path: "/ocean-xray", code: "05", icon: Box, desc: "3D Volumetric Subsurface Tomography" },
  { label: "ANOMALIES", path: "/anomalies", code: "06", icon: AlertTriangle, desc: "Subsurface Marine Heatwaves" },
  { label: "VALIDATION", path: "/validation", code: "07", icon: CheckCircle, desc: "ARGO In-Situ CTD Independent Test" },
  { label: "PIPELINE", path: "/pipeline", code: "08", icon: GitBranch, desc: "Automated Satellite Ingestion" },
  { label: "SYSTEM", path: "/system", code: "09", icon: Activity, desc: "Inference Engine Health & CUDA" },
];

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020612] text-slate-100 font-sans select-none">
      {/* ── Minimal Floating Top Bar ────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 h-13 z-40 flex items-center justify-between px-4 lg:px-6 bg-[#020612]/75 backdrop-blur-md border-b border-cyan-500/15 font-mono-tech pointer-events-auto">
        {/* Top-Left: Small Premium OceanEmbed Brand */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#0866C6] to-[#18BFEF] flex items-center justify-center shadow-[0_0_12px_rgba(24,191,239,0.5)] group-hover:brightness-110 transition-all">
            <Globe size={13} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-bold tracking-wider text-white font-display">
                OCEANEMBED
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[9px] text-cyan-400/90 tracking-widest uppercase block mt-0.5 font-medium">
              SUBSURFACE INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Top-Center: Minimal Ocean View Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#040f20]/80 border border-cyan-500/25 text-xs text-cyan-200">
          <Radio size={11} className="text-cyan-400 animate-pulse" />
          <span className="font-bold text-[11px] tracking-wide">GLOBAL OCEAN VIEW</span>
          <span className="text-slate-500">·</span>
          <span className="text-[10px] text-slate-300">NORTH INDIAN OCEAN</span>
        </div>

        {/* Top-Right: Date, Demo Mode, Floating Menu Trigger */}
        <div className="flex items-center gap-3 text-xs">
          {/* UTC Date */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 px-2 py-0.5 rounded bg-[#030d1d]/80 border border-slate-800 text-[11px]">
            <Calendar size={11} className="text-cyan-400" />
            <span>18 SEP 2026</span>
          </div>

          {/* Demo Badge */}
          <DemoBadge />

          {/* Floating Minimal Navigation Menu Button (☰) */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all shadow-[0_0_12px_rgba(24,191,239,0.25)] cursor-pointer"
            aria-label="Toggle Mission Modules Menu"
          >
            {navOpen ? <X size={14} className="text-cyan-300" /> : <Menu size={14} className="text-cyan-300" />}
            <span className="hidden sm:inline tracking-wider">MODULES</span>
          </button>
        </div>
      </header>

      {/* ── Main Viewport ──────────────────────────────────────────────────── */}
      <main
        className={`w-full h-full relative z-10 ${
          isDashboard ? "overflow-hidden p-0 m-0" : "overflow-y-auto pt-16 p-4 lg:p-6"
        }`}
      >
        <Outlet />
      </main>

      {/* ── Floating Navigation Modal / Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {navOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
              onClick={() => setNavOpen(false)}
            />

            {/* Floating Glass Navigation Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed top-16 right-4 sm:right-6 w-80 sm:w-96 max-h-[82vh] overflow-y-auto bg-[#030c1a]/95 border border-cyan-500/40 rounded-xl p-4 text-white z-50 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(24,191,239,0.2)] font-mono-tech backdrop-blur-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    MISSION WORKFLOW MODULES
                  </span>
                </div>
                <button
                  onClick={() => setNavOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Module Links */}
              <div className="space-y-1.5">
                {navModules.map(({ label, path, code, icon: Icon, desc }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => {
                        navigate(path);
                        setNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/15 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(24,191,239,0.25)] font-bold"
                          : "bg-[#020712]/70 hover:bg-[#071933] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded ${
                            isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-[#020712] text-[#18BFEF] group-hover:text-cyan-300"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold tracking-wide">{label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                            {desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-tech group-hover:text-cyan-300">
                        {code}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Specs */}
              <div className="mt-4 pt-3 border-t border-cyan-500/15 flex items-center justify-between text-[10px] text-slate-400">
                <span>0.25° Grid · 0–1000m Depth</span>
                <span className="text-cyan-300 font-semibold">GLORYS · ARGO</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
