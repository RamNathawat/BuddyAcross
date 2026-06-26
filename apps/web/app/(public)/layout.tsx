import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Public Header */}
      <header className="border-border border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="text-xl font-bold">
            <span className="text-primary">Buddy</span>
            <span className="text-foreground">Across</span>
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-border border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} BuddyAcross. All rights reserved.
            </p>
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
