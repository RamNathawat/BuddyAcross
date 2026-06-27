import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      {/* Public Header */}
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-lime-400 flex items-center justify-center text-black font-bold glow-lime">
              B
            </div>
            <span className="font-bold text-lg tracking-tight">BuddyAcross</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-lime-400 hover:bg-lime-500 text-black font-medium rounded-md px-4 py-2 text-sm shadow transition-colors btn-press hover-glow-btn"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-border border-t bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-600 dark:text-lime-400 font-bold text-xs">
                B
              </div>
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} BuddyAcross. A friend in every city.
              </p>
            </div>
            <div className="text-muted-foreground flex gap-6 text-sm">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
