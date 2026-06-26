"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, Topbar, MobileNav } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const role = pathname?.startsWith("/buddy") ? "buddy" : "tasker";

  return (
    <div className="min-h-screen">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 pb-20 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileNav role={role} />
    </div>
  );
}
