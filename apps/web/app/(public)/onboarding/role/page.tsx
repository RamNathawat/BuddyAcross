"use client";

import { useRouter } from "next/navigation";
import { UserCheck, Briefcase } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleSelectRole = (role: "tasker" | "buddy") => {
    localStorage.setItem("buddy_user_role", role);
    router.push(`/onboarding/${role}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How do you want to use BuddyAcross?</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Choose your primary role. You can switch or manage account preferences anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasker Card */}
          <Card
            onClick={() => handleSelectRole("tasker")}
            className="group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md bg-card/60 backdrop-blur-sm p-2 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="size-7" />
              </div>
              <CardTitle className="text-2xl font-bold">I am a Tasker</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-foreground/80">
                I want to post tasks, hire trusted neighbours, and get household chores, delivery, or repairs done quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Continue as Tasker →
              </div>
            </CardContent>
          </Card>

          {/* Buddy Card */}
          <Card
            onClick={() => handleSelectRole("buddy")}
            className="group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md bg-card/60 backdrop-blur-sm p-2 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="size-7" />
              </div>
              <CardTitle className="text-2xl font-bold">I am a Buddy</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-foreground/80">
                I want to earn flexible income by offering my skills (cleaning, moving, repairs, delivery) to verified local residents.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Continue as Buddy →
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
