"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function TaskerOnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("buddy_auth_token") || "demo-token";

    localStorage.setItem("buddy_user_name", fullName);
    localStorage.setItem("buddy_profile_city", city);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          role: "tasker",
          city,
          state,
          pincode,
          address,
        }),
      });
    } catch {
      // Offline fallback
    }

    toast.success("Profile saved! Welcome to BuddyAcross.");
    router.push("/tasker");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />

      {/* Progress Tracker Header */}
      <div className="mb-6 w-full max-w-xl relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-medium">
          <span>Quick Setup</span>
          <span className="text-lime-600 dark:text-lime-400 font-bold">100% Ready on Save</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
          <div className="h-full bg-lime-400 rounded-full glow-lime" style={{ width: "100%" }} />
        </div>
      </div>

      <Card className="w-full max-w-xl shadow-lg border-2 border-border bg-card/90 backdrop-blur-md animate-fade-in relative z-10">
        <CardHeader className="space-y-2 text-center border-b border-border/50 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-semibold mx-auto mb-1">
            <span>📋 Task Poster Profile</span>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Set Up Your Tasker Account</CardTitle>
          <CardDescription className="text-sm">Provide your address details to quickly match with nearby verified Buddies</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-bold">Full Name *</label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 bg-background/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-bold">City *</label>
                <Input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-bold">State *</label>
                <Input
                  id="state"
                  type="text"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pincode" className="text-sm font-bold">Pincode *</label>
                <Input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="560034"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="h-11 font-mono bg-background/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-bold">Default Location / Area (Optional)</label>
              <Textarea
                id="address"
                autoComplete="street-address"
                placeholder="Indiranagar 2nd Stage, near Metro Station"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-background/60"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 px-6">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-lime-400 hover:bg-lime-500 text-black shadow-md glow-lime hover-glow-btn btn-press"
              disabled={loading}
            >
              {loading ? "Saving Profile..." : "Go to Tasker Dashboard →"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
