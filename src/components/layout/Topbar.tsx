import { MapPin, Calendar, Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6 shrink-0">
      {/* Left — region */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MapPin size={16} className="text-[#0866C6]" />
        <span>North Indian Ocean</span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar size={15} />
          <span>18 Sep 2026</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search location..."
            className="h-8 w-48 rounded-md border border-gray-200 bg-[#F3FAFD] pl-8 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#0866C6] focus:ring-1 focus:ring-[#0866C6]/30"
          />
        </div>

        {/* Notification bell */}
        <button className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Demo mode badge */}
        <span className="rounded-full bg-[#F59E0B]/15 px-2.5 py-0.5 text-xs font-semibold text-[#92400E] select-none">
          DEMO MODE
        </span>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0866C6] text-xs font-bold text-white select-none">
          AU
        </div>
      </div>
    </header>
  );
}
