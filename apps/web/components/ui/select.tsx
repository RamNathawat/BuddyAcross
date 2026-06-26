import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.ComponentProps<"select"> {
  label?: string
  error?: string
}

function Select({ className, children, label, error, ...props }: SelectProps) {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-sm font-medium leading-none text-foreground">{label}</label>}
      <div className="relative">
        <select
          data-slot="select"
          className={cn(
            "border-input bg-background text-foreground flex h-10 w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive focus-visible:border-destructive" : "",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export { Select }
