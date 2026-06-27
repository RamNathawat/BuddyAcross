"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut } from "lucide-react";
import { performLogout } from "@/lib/auth/logout";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const router = useRouter();

  return (
    <header className="bg-card/80 border-border sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {title && (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground relative p-1.5 rounded-lg hover:bg-accent transition-colors" title="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <button
          onClick={() => performLogout(router)}
          className="text-muted-foreground hover:text-destructive relative p-1.5 rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

