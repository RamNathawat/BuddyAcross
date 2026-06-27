"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [role, setRole] = useState<"tasker" | "buddy">("buddy");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = email.trim();
    if (!cleanInput) {
      toast.error("Please enter your phone number or email address");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    localStorage.removeItem("buddy_kyc_status");
    localStorage.removeItem("buddy_live_kyc_submission");
    localStorage.removeItem("buddy_kyc_rejection_reason");
    localStorage.setItem("buddy_user_role", role);
    localStorage.setItem("buddy_user_name", fullName);
    localStorage.setItem("buddy_profile_city", city);

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

      if (isEmail) {
        localStorage.setItem("buddy_user_email", targetIdentifier);
      } else {
        localStorage.setItem("buddy_user_phone", targetIdentifier);
      }

      let authError = null;

      if (isEmail) {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetIdentifier,
          options: {
            emailRedirectTo: `${window.location.origin}/verify?email=${encodeURIComponent(targetIdentifier)}`,
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
        toast.error(authError.message || "Failed to send verification OTP.");
        return;
      }

      toast.success("Verification code sent successfully!");
      router.push(`/verify?email=${encodeURIComponent(targetIdentifier)}`);
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

      {/* Right Column - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative animate-fade-in">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm">Join the neighbourhood task network in under a minute</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selection Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole("tasker")}
                className={`text-left rounded-xl border-2 p-3.5 transition-all btn-press ${
                  role === "tasker"
                    ? "border-lime-400 bg-lime-400/10 glow-lime shadow-xs"
                    : "border-border hover:border-lime-400/40 bg-card/50"
                }`}
              >
                <div className="font-semibold text-sm">Task Poster</div>
                <div className="text-xs text-muted-foreground mt-0.5">I need help with tasks</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("buddy")}
                className={`text-left rounded-xl border-2 p-3.5 transition-all btn-press ${
                  role === "buddy"
                    ? "border-lime-400 bg-lime-400/10 glow-lime shadow-xs"
                    : "border-border hover:border-lime-400/40 bg-card/50"
                }`}
              >
                <div className="font-semibold text-sm">Buddy</div>
                <div className="text-xs text-muted-foreground mt-0.5">I want to earn doing tasks</div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="font-medium text-sm">
                  Full name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Aarav Mehta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 bg-background/60"
                />
              </div>

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

              <div className="space-y-1.5">
                <label htmlFor="city" className="font-medium text-sm">
                  City
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
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
              Already a member?{" "}
              <Link href="/login" className="text-lime-500 dark:text-lime-400 font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
