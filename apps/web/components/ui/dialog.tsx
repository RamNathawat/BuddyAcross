"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-foreground/20 fixed inset-0 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="z-50 relative">{children}</div>
    </div>
  )
}

function DialogContent({
  className,
  children,
  onClose,
  ...props
}: React.ComponentProps<"div"> & { onClose?: () => void }) {
  return (
    <div
      data-slot="dialog-content"
      className={cn(
        "bg-card text-card-foreground relative grid w-full max-w-lg gap-4 rounded-xl border p-6 shadow-lg animate-scale-in mx-4",
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
