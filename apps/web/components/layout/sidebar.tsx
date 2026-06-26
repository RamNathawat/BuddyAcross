"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  User,
  Search,
  Gavel,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const taskerNav: NavItem[] = [
  { label: "Dashboard", href: "/tasker", icon: LayoutDashboard },
  { label: "My Tasks", href: "/tasker/tasks", icon: ListTodo },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

const buddyNav: NavItem[] = [
  { label: "Dashboard", href: "/buddy", icon: LayoutDashboard },
  { label: "Browse Tasks", href: "/buddy/browse", icon: Search },
  { label: "My Bids", href: "/buddy/my-bids", icon: Gavel },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  role: "tasker" | "buddy";
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "tasker" ? taskerNav : buddyNav;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="bg-foreground/20 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="border-border flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="text-xl font-bold">
            <span className="text-primary">Buddy</span>
            <span className="text-foreground">Across</span>
          </Link>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/tasker" &&
                item.href !== "/buddy" &&
                pathname.startsWith(item.href));

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

        {/* Footer */}
        <div className="border-border border-t p-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} BuddyAcross
          </p>
        </div>
      </aside>
    </>
  );
}
