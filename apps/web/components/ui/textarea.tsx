import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
