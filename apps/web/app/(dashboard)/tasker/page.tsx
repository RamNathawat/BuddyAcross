"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, ListTodo, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function TaskerDashboardPage() {
  const [userName, setUserName] = useState("Tasker");
  const [city, setCity] = useState("Bengaluru");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkRole() {
      const saved = localStorage.getItem("buddy_user_name");
      if (saved) setUserName(saved);
      const savedCity = localStorage.getItem("buddy_profile_city");
      if (savedCity) setCity(savedCity);

      const token = localStorage.getItem("buddy_auth_token");
      if (token && token !== "demo-token") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.data?.user?.fullName) {
              setUserName(data.data.user.fullName);
              localStorage.setItem("buddy_user_name", data.data.user.fullName);
            }
            if (data?.data?.profile?.city) {
              setCity(data.data.profile.city);
              localStorage.setItem("buddy_profile_city", data.data.profile.city);
            }
          }
        } catch {}
      }

      const { data: authData } = await supabase.auth.getUser();
      const role = (authData?.user?.app_metadata?.role as string) || (authData?.user?.user_metadata?.role as string) || localStorage.getItem("buddy_user_role") || "tasker";
      if (role !== "tasker") {
        toast.error("Unauthorized access");
        router.push("/unauthorized");
      }
    }
    checkRole();
  }, [router, supabase]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-lime-400/15 via-background to-card border-2 border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-bold">
            <Zap className="size-3" /> Hyperlocal Poster Hub
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Your Tasker profile is verified for {city} hyperlocal service zones.
          </p>
        </div>
        <Button disabled className="bg-lime-400 text-black font-bold opacity-80 shadow-md glow-lime relative z-10 h-11 px-6">
          <PlusCircle className="size-4 mr-2" /> Post Task (Phase 3)
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Account Status</CardTitle>
            <div className="p-2 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400">Active Poster Account</div>
            <p className="text-xs text-muted-foreground mt-1">Phone verified. Ready to post tasks and hire KYC-verified community Buddies.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Active Requirements</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <ListTodo className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">0 Tasks</div>
            <p className="text-xs text-muted-foreground mt-1">Task bidding & matching unlocks in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-2 border-dashed border-border p-2">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span>🎯 Phase 2 Milestone Completed</span>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Your onboarding and profile setup align perfectly with BuddyAcross standards. In Phase 3, this dashboard will feature live chore postings, incoming bids from local Buddies, and real-time chat.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
