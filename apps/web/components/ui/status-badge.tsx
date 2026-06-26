import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

// ============================================================
// Status Badge — color-coded by task/bid/escrow status
// ============================================================
const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        draft: "bg-muted text-muted-foreground",
        active: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-destructive/10 text-destructive",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export function StatusBadge({
  className,
  variant,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Maps task/bid/escrow status strings to badge variants.
 * Import and use: <StatusBadge variant={getStatusVariant(status)}>
 */
export function getStatusVariant(
  status: string
): VariantProps<typeof statusBadgeVariants>["variant"] {
  const map: Record<string, VariantProps<typeof statusBadgeVariants>["variant"]> = {
    // Task
    draft: "draft",
    posted: "active",
    bid_received: "info",
    accepted: "info",
    escrow_pending: "warning",
    in_progress: "active",
    completed: "success",
    cancelled: "danger",
    disputed: "danger",
    // Bid
    pending: "warning",
    withdrawn: "draft",
    // Escrow
    confirmed: "info",
    released: "success",
    refunded: "draft",
    // KYC
    approved: "success",
    rejected: "danger",
  };

  return map[status] || "default";
}
