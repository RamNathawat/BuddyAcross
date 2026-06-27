"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Radar, Wallet, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BuddyDashboardPage() {
  const [userName, setUserName] = useState("Buddy");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedName = localStorage.getItem("buddy_user_name");
    if (savedName) setUserName(savedName);

    // Protected Route RBAC & KYC Check
    const kycStatus = localStorage.getItem("buddy_kyc_status") || "approved";
    const role = localStorage.getItem("buddy_user_role") || "buddy";

    if (role !== "buddy") {
      toast.error("Unauthorized access");
      router.push("/unauthorized");
      return;
    }

    if (kycStatus !== "approved") {
      toast.warning("Your KYC is still pending review");
      router.push("/pending-approval");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse font-medium">Verifying Buddy security access...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-lime-400/15 via-background to-card border-2 border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-bold">
            <Zap className="size-3" /> Hyperlocal Buddy Partner
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Hello, {userName}! 👋</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-lime-400 text-black text-xs font-bold shadow-xs glow-lime">
              <ShieldCheck className="size-3.5" /> KYC Verified
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            You are cleared and verified to accept tasks across your Bengaluru hyperlocal zone.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Trust Status</CardTitle>
            <div className="p-2 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400">Approved</div>
            <p className="text-xs text-muted-foreground mt-1">Aadhaar &amp; Selfie verified.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Zone Radius</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Radar className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">5.0 km</div>
            <p className="text-xs text-muted-foreground mt-1">Bengaluru Hyperlocal Zone.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border hover:border-lime-400/40 transition-all shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-xl group-hover:bg-lime-400/15 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Total Earnings</CardTitle>
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Wallet className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">₹0</div>
            <p className="text-xs text-muted-foreground mt-1">Unlocks with bids in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-2 border-dashed border-border p-2">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span>🎯 Ready for Phase 3 Marketplace</span>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Your KYC onboarding is fully completed. Once Phase 3 initiates, you will receive real-time notifications for nearby cleaning, repair, and errand requests to bid on and earn.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
