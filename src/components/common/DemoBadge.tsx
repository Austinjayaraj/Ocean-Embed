export default function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-mono-tech font-bold rounded border border-amber-500/30 uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.15)]">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      DEMO MODE
    </span>
  );
}
