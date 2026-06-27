"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const processSuccessfulAuth = async (user: any, token: string, userEmail?: string) => {
    localStorage.setItem("buddy_auth_token", token);
    localStorage.setItem("buddy_user_id", user.id);
    if (userEmail || user.email) localStorage.setItem("buddy_user_email", userEmail || user.email);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/auth/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, email: userEmail || user.email }),
      });
    } catch {}

    toast.success("Identity verified successfully!");

    const savedRole = localStorage.getItem("buddy_user_role");
    if (!savedRole) {
      router.push("/onboarding/role");
    } else if (savedRole === "tasker") {
      router.push("/tasker");
    } else if (savedRole === "buddy") {
      const kycStatus = localStorage.getItem("buddy_kyc_status");
      if (kycStatus === "approved") {
        router.push("/buddy");
      } else if (kycStatus === "pending" || kycStatus === "rejected") {
        router.push("/pending-approval");
      } else {
        router.push("/onboarding/buddy");
      }
    } else if (savedRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/onboarding/role");
    }
  };

  useEffect(() => {
    if (emailParam) setEmail(emailParam);

    // Auto-detect ONLY if user arrived via magic link confirmation URL with tokens or code
    const isMagicLinkRedirect = typeof window !== "undefined" && (
      window.location.hash.includes("access_token=") ||
      window.location.search.includes("code=") ||
      window.location.hash.includes("type=recovery") ||
      window.location.hash.includes("type=signup")
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMagicLinkRedirect && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        processSuccessfulAuth(session.user, session.access_token, session.user.email);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMagicLinkRedirect && session?.user) {
        processSuccessfulAuth(session.user, session.access_token, session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit passcode");
      return;
    }

    setLoading(true);
    try {
      const isEmail = email.includes("@");
      let targetIdentifier = email.trim();
      if (!isEmail) {
        targetIdentifier = targetIdentifier.replace(/[\s-]/g, "");
        if (!targetIdentifier.startsWith("+")) {
          if (targetIdentifier.length === 10) {
            targetIdentifier = "+91" + targetIdentifier;
          } else if (targetIdentifier.startsWith("91") && targetIdentifier.length === 12) {
            targetIdentifier = "+" + targetIdentifier;
          } else {
            targetIdentifier = "+" + targetIdentifier;
          }
        }
      }

      let verifyResult;

      if (isEmail) {
        verifyResult = await supabase.auth.verifyOtp({
          email: targetIdentifier,
          token: otp,
          type: "email",
        });
      } else {
        verifyResult = await supabase.auth.verifyOtp({
          phone: targetIdentifier,
          token: otp,
          type: "sms",
        });
      }

      const { data, error } = verifyResult;

      if (error || !data?.user) {
        // Smart Hybrid / Fallback verification for SMS testing
        if (!isEmail) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/auth/verify-otp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: targetIdentifier, otp }),
            });
            if (res.ok) {
              const fallbackJson = await res.json();
              if (fallbackJson.success) {
                const numOnly = targetIdentifier.replace(/\D/g, "");
                const dummyId = "user_" + numOnly;
                await processSuccessfulAuth({ id: dummyId, phone: targetIdentifier }, "demo-token-" + dummyId, targetIdentifier);
                return;
              }
            }
          } catch {}
        }

        toast.error(error?.message || "Invalid OTP verification code. Please try again.");
        setLoading(false);
        return;
      }

      await processSuccessfulAuth(data.user, data.session?.access_token || "", email);
    } catch (err: any) {
      toast.error(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-fade-in">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Verify Passcode</h1>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit verification code sent to <span className="font-semibold text-foreground">{email || "your device"}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        {!emailParam && (
          <div className="space-y-1.5">
            <label className="font-medium text-sm">Phone or Email</label>
            <Input
              type="text"
              placeholder="+91 98xxxxxxxx / name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-background/60"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="otp" className="font-medium text-sm">One-Time Passcode (OTP)</label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="• • • • • •"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            className="h-14 text-center text-2xl font-mono tracking-[0.5em] font-bold bg-background/60 focus-visible:ring-lime-400 border-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full h-11 rounded-xl bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-black font-semibold shadow-sm hover-glow-btn transition-all btn-press disabled:opacity-50 mt-2"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-background">
      {/* Left Column - Hero Branding Banner */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-lime-400/15 via-background to-background p-12 flex-col justify-between relative overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="h-9 w-9 rounded-xl bg-lime-400 flex items-center justify-center text-black font-bold text-lg glow-lime shadow-sm">
              B
            </div>
            <span className="font-bold text-xl tracking-tight">BuddyAcross</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4 my-auto py-12">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Secure, trusted <span className="text-lime-500 dark:text-lime-400">verification.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Protecting our community of verified local residents and taskers with enterprise-grade security.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} BuddyAcross Technologies Inc.
        </div>
      </div>

      {/* Right Column - Verify Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading verification...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
