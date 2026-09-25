import { NavLink } from "react-router-dom";
import {
  Waves,
  LayoutDashboard,
  Globe,
  Thermometer,
  Box,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Ocean Explorer", path: "/explorer", icon: Globe },
  { label: "Temperature Profile", path: "/profile", icon: Thermometer },
  { label: "3D Ocean X-Ray", path: "/ocean-xray", icon: Box },
  { label: "Anomalies", path: "/anomalies", icon: AlertTriangle },
  { label: "ARGO Validation", path: "/validation", icon: CheckCircle },
  { label: "Data Pipeline", path: "/pipeline", icon: GitBranch },
  { label: "System Health", path: "/system", icon: Activity },
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
        className="fixed top-3 left-3 z-50 lg:hidden rounded-md bg-[#071B33] p-2 text-white shadow-lg"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile slide-in sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#071B33] text-white lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop — always-visible sidebar (no animation) */}
      <aside className="hidden lg:flex w-60 flex-col bg-[#071B33] text-white shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent() {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Waves size={28} className="text-[#18BFEF]" />
        <span className="text-lg font-bold tracking-wider">OCEANEMBED</span>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-[3px] border-[#18BFEF] bg-white/10 text-white"
                  : "border-l-[3px] border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom info */}
      <div className="border-t border-white/10 px-5 py-4 text-xs text-gray-400 space-y-1.5">
        <p>Model: OceanEmbed v1.0</p>
        <p className="flex items-center gap-1.5">
          Status:{" "}
          <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
          <span className="text-[#22C55E]">Operational</span>
        </p>
        <p>Last updated: 18 Sep 2026, 06:24 UTC</p>
      </div>
    </>
  );
}
