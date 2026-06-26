import * as React from "react"
import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      src={src}
      alt={alt}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground flex h-full w-full items-center justify-center rounded-full text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
