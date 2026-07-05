import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

/**
 * App shell for authenticated pages: a fixed sidebar (drawer on mobile) and a
 * sticky top navbar, with routed content rendered through <Outlet />.
 */
export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <AppNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
