import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl font-bold opacity-10">404</div>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
