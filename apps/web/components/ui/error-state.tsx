import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center",
        className
      )}
    >
      <div className="bg-destructive/10 flex h-14 w-14 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive h-7 w-7" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
