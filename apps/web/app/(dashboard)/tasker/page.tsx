"use client";

import { useEffect, useState } from "react";
import { PlusCircle, ListTodo, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaskerDashboardPage() {
  const [userName, setUserName] = useState("Tasker");

  useEffect(() => {
    const saved = localStorage.getItem("buddy_user_name");
    if (saved) setUserName(saved);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-muted-foreground">Your Tasker account is active and verified.</p>
        </div>
        <Button disabled className="opacity-80 shadow-sm font-semibold">
          <PlusCircle className="size-4 mr-2" /> Post a New Task (Phase 3)
        </Button>
      </div>

      {/* Phase 2 Status placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Account Status</CardTitle>
            <ShieldCheck className="size-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active & Verified</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to hire hyperlocal Buddies.</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Active Tasks</CardTitle>
            <ListTodo className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Task marketplace unlocks in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-semibold">🚀 Phase 2 Onboarding Milestone Reached</CardTitle>
          <CardDescription>
            You have completed passwordless login and profile creation. In the next development phase, this dashboard will show your task postings, incoming bids, and live chat.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
