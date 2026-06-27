"use client";

import { useState } from "react";
import { AdminSidebar, Topbar } from "@/components/layout";
import { useAuthSync } from "@/lib/auth/logout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title="Admin Panel"
        />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
