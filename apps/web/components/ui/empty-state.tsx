import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center",
        className
      )}
    >
      <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-7 w-7" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
