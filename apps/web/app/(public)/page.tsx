export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32">
        <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
          ✨ Launching Soon
        </div>

        <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Get things done,{" "}
          <span className="text-primary">locally</span>
        </h1>

        <p className="text-muted-foreground mb-10 max-w-2xl text-lg sm:text-xl">
          Connect with trusted service providers in your neighbourhood. Post a
          task, receive bids, and get it done — all in one place.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3.5 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            Post a Task
          </a>
          <a
            href="/register"
            className="border-border hover:bg-accent rounded-xl border px-8 py-3.5 text-base font-semibold transition-all"
          >
            Become a Buddy
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 border-border border-y">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Post a Task",
                description:
                  "Describe what you need done, set your budget, and choose your location.",
              },
              {
                step: "2",
                title: "Get Bids",
                description:
                  "Nearby Buddies see your task and bid on it. Compare and pick the best one.",
              },
              {
                step: "3",
                title: "Get it Done",
                description:
                  "Your Buddy completes the task. Pay securely through escrow and leave a review.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-card rounded-2xl border p-8 text-center shadow-sm"
              >
                <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
