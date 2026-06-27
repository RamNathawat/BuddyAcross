"use client";

import { useRouter } from "next/navigation";
import { UserCheck, Briefcase } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RoleSelectionPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSelectRole = async (role: "tasker" | "buddy") => {
    localStorage.setItem("buddy_user_role", role);
    const userId = localStorage.getItem("buddy_user_id") || "demo_user_" + Math.floor(Math.random() * 1000);
    const userEmail = localStorage.getItem("buddy_user_email") || `${userId}@example.com`;

    try {
      await supabase.from("users").upsert({
        id: userId,
        email: userEmail,
        full_name: userEmail.split("@")[0],
        role: role,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }

    if (role === "buddy") {
      router.push("/onboarding/kyc");
    } else {
      router.push(`/onboarding/${role}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />

      <div className="w-full max-w-3xl space-y-8 animate-fade-in relative z-10 py-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-semibold mb-2">
            <span>⚡ Phase 2 Onboarding</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How do you want to use BuddyAcross?</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Choose your primary role. You can switch or manage account preferences anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasker Card */}
          <Card
            onClick={() => handleSelectRole("tasker")}
            className="group cursor-pointer border-2 border-border hover:border-lime-400 transition-all duration-300 shadow-sm hover:shadow-md hover:glow-lime bg-card/80 backdrop-blur-sm p-2 flex flex-col justify-between relative overflow-hidden btn-press"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-lime-400/20 transition-colors" />
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-lime-400/15 border border-lime-400/30 flex items-center justify-center text-lime-600 dark:text-lime-400 group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="size-7" />
              </div>
              <CardTitle className="text-2xl font-bold">I am a Tasker</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-foreground/80">
                I want to post tasks, hire trusted neighbours, and get household chores, delivery, or repairs done quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-lime-600 dark:text-lime-400 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Continue as Tasker →
              </div>
            </CardContent>
          </Card>

          {/* Buddy Card */}
          <Card
            onClick={() => handleSelectRole("buddy")}
            className="group cursor-pointer border-2 border-border hover:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-purple-500/10 bg-card/80 backdrop-blur-sm p-2 flex flex-col justify-between relative overflow-hidden btn-press"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="size-7" />
              </div>
              <CardTitle className="text-2xl font-bold">I am a Buddy</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-foreground/80">
                I want to earn flexible income by offering my skills (cleaning, moving, repairs, delivery) to verified local residents.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Continue as Buddy →
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
