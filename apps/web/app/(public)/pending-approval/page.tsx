"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, LogOut, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { performLogout } from "@/lib/auth/logout";

export default function PendingApprovalPage() {
  const [status, setStatus] = useState("pending");
  const [reason, setReason] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkCurrentStatus = async () => {
      let userId = localStorage.getItem("buddy_user_id");
      if (!userId) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          userId = authData.user.id;
          localStorage.setItem("buddy_user_id", userId);
        }
      }

      if (userId) {
        try {
          const { data } = await supabase.from("buddy_profiles").select("id, kyc_status").eq("user_id", userId).single();
          if (data?.kyc_status) {
            localStorage.setItem("buddy_kyc_status", data.kyc_status);
          } else if (data?.id) {
            const { data: kycRow } = await supabase.from("kyc_submissions").select("status").eq("buddy_id", data.id).single();
            if (kycRow?.status) {
              localStorage.setItem("buddy_kyc_status", kycRow.status);
            }
          }
        } catch {}
      }

      const savedStatus = localStorage.getItem("buddy_kyc_status") || "pending";
      const savedReason = localStorage.getItem("buddy_kyc_rejection_reason") || "";
      if (savedStatus === "approved") {
        await supabase.auth.refreshSession();
        router.push("/buddy");
      } else {
        setStatus(savedStatus);
        setReason(savedReason);
      }
    };

    checkCurrentStatus();
    window.addEventListener("storage", checkCurrentStatus);
    return () => window.removeEventListener("storage", checkCurrentStatus);
  }, [router]);

  const handleCheckStatus = async () => {
    toast.info("Checking latest status...");
    let userId = localStorage.getItem("buddy_user_id");
    if (!userId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        userId = authData.user.id;
        localStorage.setItem("buddy_user_id", userId);
      }
    }

    if (userId) {
      try {
        const { data } = await supabase.from("buddy_profiles").select("id, kyc_status").eq("user_id", userId).single();
        if (data?.kyc_status) {
          localStorage.setItem("buddy_kyc_status", data.kyc_status);
        } else if (data?.id) {
          const { data: kycRow } = await supabase.from("kyc_submissions").select("status").eq("buddy_id", data.id).single();
          if (kycRow?.status) {
            localStorage.setItem("buddy_kyc_status", kycRow.status);
          }
        }
      } catch {}
    }

    const current = localStorage.getItem("buddy_kyc_status") || "pending";
    if (current === "approved") {
      await supabase.auth.refreshSession();
      toast.success("Congratulations! Your KYC is approved!");
      router.push("/buddy");
    } else if (current === "rejected" || current === "resubmission_requested") {
      setStatus(current);
      toast.error("Action required on your KYC submission.");
    } else {
      toast.info("Still under review. Thanks for your patience!");
    }
  };

  const handleLogout = () => {
    performLogout(router);
  };

  if (status === "rejected" || status === "resubmission_requested") {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20 text-center p-4 animate-fade-in">
          <CardHeader className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="size-8" />
            </div>
            <CardTitle className="text-2xl font-bold">KYC Resubmission Needed</CardTitle>
            <CardDescription className="text-sm">
              Unfortunately, your identity documents could not be verified automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-destructive/5 p-4 rounded-xl text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-destructive">Admin Review Notes:</p>
            <p className="text-sm font-medium">{reason || "Document blurry or address incomplete. Please re-upload clear photos."}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button className="w-full h-11" onClick={() => router.push("/onboarding/kyc")}>
              Re-upload KYC Documents →
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="w-full text-xs text-muted-foreground">
              <LogOut className="size-3.5 mr-1" /> Log out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-background/80 backdrop-blur-md text-center p-4 animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 animate-pulse">
            <Clock className="size-9" />
          </div>
          <CardTitle className="text-2xl font-bold">KYC Under Verification</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Our trust &amp; safety team is verifying your Aadhaar card and live selfie. This ensures BuddyAcross remains a secure marketplace for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground">
            ⏱️ Approvals typically complete within <strong className="text-foreground">2 hours</strong>. You can safely close this page and check back later.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button onClick={handleCheckStatus} variant="outline" className="w-full h-11 font-medium">
            <RefreshCw className="size-4 mr-2" /> Check Verification Status
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="w-full text-xs text-muted-foreground">
            <LogOut className="size-3.5 mr-1" /> Log out / Switch Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
