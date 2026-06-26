"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function DropdownMenu({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<any>, { open, setOpen })
      })}
    </div>
  )
}

function DropdownMenuTrigger({
  children,
  open,
  setOpen,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { open?: boolean; setOpen?: (open: boolean) => void; asChild?: boolean }) {
  const handleToggle = () => setOpen?.(!open)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleToggle,
    })
  }

  return (
    <button type="button" onClick={handleToggle} {...props}>
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  children,
  open,
  setOpen,
  align = "right",
  ...props
}: React.ComponentProps<"div"> & { open?: boolean; setOpen?: (open: boolean) => void; align?: "left" | "right" }) {
  if (!open) return null

  return (
    <div
      data-slot="dropdown-menu-content"
      className={cn(
        "bg-popover text-popover-foreground absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border p-1 shadow-md animate-fade-in",
        align === "right" ? "right-0" : "left-0",
        className
      )}
      onClick={() => setOpen?.(false)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
