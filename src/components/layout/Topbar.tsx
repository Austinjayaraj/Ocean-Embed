import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Search, Bell, Box } from "lucide-react";
import DemoBadge from "../common/DemoBadge";

export default function Topbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate("/explorer");
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-cyan-500/15 bg-[#030a16]/95 px-4 lg:px-6 shrink-0 relative z-20 backdrop-blur-md font-mono-tech">
      {/* Left — Mission Target Coordinate */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#07182e] border border-cyan-500/25 text-xs text-cyan-200">
          <MapPin size={14} className="text-[#18BFEF] animate-pulse" />
          <span className="font-bold">NORTH INDIAN OCEAN</span>
          <span className="hidden sm:inline text-slate-400">· 12.0°N, 85.0°E</span>
        </div>

        <button
          onClick={() => navigate("/ocean-xray")}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs transition-colors"
        >
          <Box size={13} className="text-cyan-400" />
          <span>Launch 3D X-Ray</span>
        </button>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 lg:gap-4 text-xs">
        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300 bg-[#07182e] px-2.5 py-1 rounded border border-slate-700/60">
          <Calendar size={13} className="text-cyan-400" />
          <span>18 SEP 2026</span>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400/70"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lat, lon or region..."
            className="h-8 w-56 rounded-md border border-cyan-500/20 bg-[#061224] pl-8 pr-3 text-xs text-cyan-100 placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
          />
        </form>

        {/* Notifications / Anomaly alert bell */}
        <button
          onClick={() => navigate("/anomalies")}
          className="relative rounded-md p-1.5 text-slate-300 hover:text-white bg-[#07182e] hover:bg-cyan-950/60 border border-slate-700/60 transition-colors"
          title="3 Active Subsurface Anomalies Detected"
        >
          <Bell size={16} className="text-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow-[0_0_8px_#EF4444]">
            3
          </span>
        </button>

        {/* Demo Mode Badge */}
        <DemoBadge />

        {/* Mission Operator Tag */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gradient-to-r from-blue-950 to-cyan-950 border border-cyan-500/30">
          <div className="w-5 h-5 rounded-full bg-[#0866C6] text-[10px] font-bold text-white flex items-center justify-center">
            AU
          </div>
          <span className="hidden lg:inline text-[11px] text-cyan-200 font-semibold">SIH LAB</span>
        </div>
      </div>
    </header>
  );
}
