"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ListTodo,
  Wallet,
  Star,
  Shield,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { performLogout } from "@/lib/auth/logout";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "KYC Queue", href: "/admin", icon: FileCheck },
  { label: "Users", href: "/admin", icon: Users },
  { label: "Tasks", href: "/admin", icon: ListTodo },
  { label: "Escrow", href: "/admin", icon: Wallet },
  { label: "Reviews", href: "/admin", icon: Star },
  { label: "Strikes", href: "/admin", icon: Shield },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {isOpen && (
        <div
          className="bg-foreground/20 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "bg-card border-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-border flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="text-xl font-bold">
            <span className="text-primary">Buddy</span>
            <span className="text-foreground">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-border border-t p-4 space-y-3">
          <button
            onClick={() => performLogout(router)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
          <div className="bg-warning/10 text-warning rounded-lg px-3 py-2 text-xs font-medium text-center">
            Admin Panel
          </div>
        </div>
      </aside>
    </>
  );
}
