"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: "top" | "bottom"
}

function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [show, setShow] = React.useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          data-slot="tooltip"
          className={cn(
            "bg-foreground text-background absolute z-50 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-sm animate-fade-in left-1/2 -translate-x-1/2",
            side === "top" ? "-top-8" : "-bottom-8"
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export { Tooltip }
