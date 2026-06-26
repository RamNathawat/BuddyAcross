"use client";

import { Menu, Bell } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
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
        <button className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
