"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<any>, {
          currentValue,
          onValueChange: handleValueChange,
        })
      })}
    </div>
  )
}

function TabsList({
  className,
  children,
  currentValue,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  currentValue?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1 w-fit",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<any>, {
          currentValue,
          onValueChange,
        })
      })}
    </div>
  )
}

function TabsTrigger({
  className,
  value,
  children,
  currentValue,
  onValueChange,
  ...props
}: React.ComponentProps<"button"> & {
  value: string
  currentValue?: string
  onValueChange?: (value: string) => void
}) {
  const isActive = currentValue === value

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  className,
  value,
  children,
  currentValue,
  ...props
}: React.ComponentProps<"div"> & {
  value: string
  currentValue?: string
}) {
  if (currentValue !== value) return null

  return (
    <div
      data-slot="tabs-content"
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
