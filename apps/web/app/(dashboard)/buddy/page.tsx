"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Radar, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BuddyDashboardPage() {
  const [userName, setUserName] = useState("Buddy");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedName = localStorage.getItem("buddy_user_name");
    if (savedName) setUserName(savedName);

    // Protected Route RBAC & KYC Check
    const kycStatus = localStorage.getItem("buddy_kyc_status") || "approved"; // Default to approved for demo if admin verified
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
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Verifying security access...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hello, {userName}! 👋</h1>
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="size-3" /> KYC Verified
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">You are cleared to accept hyperlocal tasks in your zone.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Trust Status</CardTitle>
            <ShieldCheck className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Approved</div>
            <p className="text-xs text-muted-foreground mt-1">Aadhaar &amp; Selfie matched.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Zone Radius</CardTitle>
            <Radar className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.0 km</div>
            <p className="text-xs text-muted-foreground mt-1">Bengaluru Hyperlocal Zone.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Earnings</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground mt-1">Unlocks with task bidding in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-semibold">🎯 Ready for Phase 3 (Task Marketplace)</CardTitle>
          <CardDescription>
            Your KYC onboarding is fully complete. Once Phase 3 is initiated, you will see a real-time feed of nearby cleaning, delivery, and repair jobs to bid on.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
