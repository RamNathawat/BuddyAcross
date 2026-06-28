"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = email.trim();
    if (!cleanInput) {
      toast.error("Please enter your phone number or email address");
      return;
    }

    setLoading(true);

    try {
      const isEmail = cleanInput.includes("@");
      let targetIdentifier = cleanInput;
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

      let authError = null;

      if (isEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
          email: targetIdentifier,
          options: {
            emailRedirectTo: `${baseUrl}/verify?email=${encodeURIComponent(targetIdentifier)}`,
          },
        });
        authError = error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: targetIdentifier,
        });
        authError = error;
      }

      if (authError) {
        toast.error(authError.message || "Failed to send login link. Please check your input.");
        return;
      }

      if (isEmail) {
        toast.success("Magic link sent! Please check your inbox.");
        router.push(`/verify?email=${encodeURIComponent(targetIdentifier)}&mode=magic_link`);
      } else {
        toast.success("SMS OTP code sent successfully!");
        router.push(`/verify?email=${encodeURIComponent(targetIdentifier)}&mode=otp`);
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred sending OTP.");
    } finally {
      setLoading(false);
    }
  };

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
            A friend in <span className="text-lime-500 dark:text-lime-400">every city.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Verified local Buddies, secure payments, and authentic community reviews. Get everyday tasks done without the hassle.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} BuddyAcross Technologies Inc.
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative animate-fade-in">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Log in with your phone number or email to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label htmlFor="email" className="font-medium text-sm">
                  Phone number or Email
                </label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="+91 98xxxxxxxx / name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-black font-semibold shadow-sm hover-glow-btn transition-all btn-press disabled:opacity-50 mt-2"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-lime-500 dark:text-lime-400 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
