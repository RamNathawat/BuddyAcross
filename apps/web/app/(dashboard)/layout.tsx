"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, Topbar, MobileNav } from "@/components/layout";
import { useAuthSync } from "@/lib/auth/logout";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<"buddy" | "tasker">(pathname?.startsWith("/buddy") ? "buddy" : "tasker");

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      const userRole = (user?.app_metadata?.role as string) || (user?.user_metadata?.role as string) || localStorage.getItem("buddy_user_role");
      if (pathname?.startsWith("/buddy") && userRole !== "buddy") {
        router.push("/unauthorized");
      } else if (pathname?.startsWith("/tasker") && userRole !== "tasker") {
        router.push("/unauthorized");
      } else if (userRole === "buddy" || userRole === "tasker") {
        setRole(userRole);
      }
    }
    checkRole();
  }, [pathname, router, supabase]);

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
