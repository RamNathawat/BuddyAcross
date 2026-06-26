"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-card p-6 shadow-lg transition ease-in-out duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="bg-foreground/20 fixed inset-0 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  )
}

function SheetContent({
  side = "right",
  className,
  children,
  onClose,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sheetVariants> & { onClose?: () => void }) {
  return (
    <div
      data-slot="sheet-content"
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

export { Sheet, SheetContent, SheetHeader, SheetTitle }
