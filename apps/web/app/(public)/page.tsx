import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Background dotted grid overlay */}
      <div className="absolute inset-0 bg-grid-dots opacity-25 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 mb-8 shadow-xs">
          <span>⚡ Live in Bengaluru Hyperlocal Zones</span>
        </div>

        <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
          Get things done,{" "}
          <span className="text-lime-400 drop-shadow-sm">locally.</span>
        </h1>

        <p className="text-muted-foreground mb-10 max-w-2xl text-lg sm:text-xl leading-relaxed">
          Connect with verified service providers right in your neighbourhood. Post a
          task, compare trusted bids, and get household chores or repairs done effortlessly.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row w-full max-w-md justify-center">
          <Link
            href="/register"
            className="bg-lime-400 hover:bg-lime-500 text-black rounded-xl px-8 py-4 text-base font-semibold shadow-lg transition-all glow-lime hover-glow-btn btn-press flex items-center justify-center gap-2"
          >
            <span>Post a Task</span>
            <span>→</span>
          </Link>
          <Link
            href="/register"
            className="border-2 border-border hover:border-lime-400/50 hover:bg-lime-400/5 text-foreground rounded-xl px-8 py-4 text-base font-semibold transition-all btn-press flex items-center justify-center"
          >
            Become a Buddy
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 bg-card/60 backdrop-blur-md border-border border-y py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              How BuddyAcross Works
            </h2>
            <p className="text-muted-foreground text-base">
              Three simple steps to connect with trusted local assistance in your area.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Post Your Requirement",
                description:
                  "Describe what you need done, set your preferred schedule, and specify your hyperlocal Bengaluru zone.",
              },
              {
                step: "2",
                title: "Review Verified Bids",
                description:
                  "Nearby KYC-verified Buddies review your request and bid. Check profiles, ratings, and choose the best fit.",
              },
              {
                step: "3",
                title: "Get it Done Seamlessly",
                description:
                  "Your Buddy completes the chore on time. Review their quality work and build a trusted local network.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group bg-background/80 hover:bg-card rounded-2xl border-2 border-border hover:border-lime-400/40 p-8 text-left shadow-sm transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 rounded-full blur-xl pointer-events-none group-hover:bg-lime-400/15 transition-colors" />
                <div className="bg-lime-400 text-black mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold shadow-sm glow-lime group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
