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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const taskerMobileNav: NavItem[] = [
  { label: "Home", href: "/tasker", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasker/tasks", icon: ListTodo },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

const buddyMobileNav: NavItem[] = [
  { label: "Home", href: "/buddy", icon: LayoutDashboard },
  { label: "Browse", href: "/buddy/browse", icon: Search },
  { label: "Bids", href: "/buddy/my-bids", icon: Gavel },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

interface MobileNavProps {
  role: "tasker" | "buddy";
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const navItems = role === "tasker" ? taskerMobileNav : buddyMobileNav;

  return (
    <nav className="bg-card/95 border-border fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around">
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
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
