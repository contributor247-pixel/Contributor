"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { PageTransition } from "@/components/shared/PageTransition";

// App-shell layout (sidebar full-height on the left, logo living
// inside it, a slim topbar scoped to the content column only) — the
// standard modern dashboard pattern (Linear/Vercel/Notion), replacing
// the previous full-width top navbar-with-logo sitting above a
// content-scoped sidebar.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
