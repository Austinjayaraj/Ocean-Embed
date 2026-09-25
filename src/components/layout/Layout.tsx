import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when resizing above the mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3FAFD]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-[#F3FAFD] p-4 lg:p-6">
          <Outlet />
        </main>

        <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 text-center text-xs text-gray-400">
          Prototype visualization. Displayed values are illustrative mock data
          and do not represent live ocean measurements.
        </footer>
      </div>
    </div>
  );
}
