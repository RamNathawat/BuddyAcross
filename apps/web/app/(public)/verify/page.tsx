"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit passcode");
      return;
    }

    setLoading(true);
    try {
      let userId = "00000000-0000-0000-0000-000000000001"; // Default demo ID

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (!error && data?.user) {
        userId = data.user.id;
        localStorage.setItem("buddy_auth_token", data.session?.access_token || "demo-token");
      } else {
        if (otp !== "123456") {
          toast.error("Invalid OTP code. In demo mode, use 123456.");
          setLoading(false);
          return;
        }
        localStorage.setItem("buddy_auth_token", "demo-token");
      }

      // Sync with Express backend
      localStorage.setItem("buddy_user_id", userId);
      localStorage.setItem("buddy_user_email", email);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, email }),
        });
      } catch {
        // Safe fallback if local Express API is not running
      }

      toast.success("Identity verified!");

      // Check existing role in localStorage or redirect to role choice
      const savedRole = localStorage.getItem("buddy_user_role");
      if (!savedRole) {
        router.push("/onboarding/role");
      } else if (savedRole === "tasker") {
        router.push("/tasker");
      } else if (savedRole === "buddy") {
        const kycStatus = localStorage.getItem("buddy_kyc_status") || "pending";
        if (kycStatus === "approved") {
          router.push("/buddy");
        } else {
          router.push("/pending-approval");
        }
      } else if (savedRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/onboarding/role");
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/10 bg-background/80 backdrop-blur-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Verify Passcode</CardTitle>
        <CardDescription>Enter the 6-digit verification code sent to {email || "your email"}</CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          {!emailParam && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
          )}
          <div className="space-y-2">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              className="h-12 text-center text-2xl font-mono tracking-widest"
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">
            💡 In demo mode without email configuration, use passcode <span className="font-mono font-bold text-primary">123456</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading || otp.length < 6}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading verification...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
