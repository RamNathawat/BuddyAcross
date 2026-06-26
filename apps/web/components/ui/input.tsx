import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
