"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_CATEGORIES } from "@buddyacross/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function BuddyOnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["cleaning", "delivery"]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length === 1) {
        toast.warning("You must keep at least one skill selected");
        return;
      }
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

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
    localStorage.setItem("buddy_profile_skills", JSON.stringify(selectedSkills));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          role: "buddy",
          city,
          state,
          pincode,
          skills: selectedSkills,
          bio,
        }),
      });
    } catch {
      // Offline fallback
    }

    toast.success("Profile saved! Next step: Identity Verification.");
    router.push("/onboarding/kyc");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />

      {/* Progress Tracker Header */}
      <div className="mb-6 w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-medium">
          <span>Step 1 of 3</span>
          <span className="text-lime-600 dark:text-lime-400 font-bold">33% complete</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
          <div className="h-full bg-lime-400 rounded-full glow-lime transition-all duration-500" style={{ width: "33.33%" }} />
        </div>
        <div className="flex justify-between mt-2 text-[11px] font-medium text-muted-foreground">
          <span className="text-lime-600 dark:text-lime-400 font-bold">Profile & Skills</span>
          <span>Identity Verification</span>
          <span>Dashboard</span>
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-lg border-2 border-border bg-card/90 backdrop-blur-md animate-fade-in relative z-10">
        <CardHeader className="space-y-2 text-center border-b border-border/50 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs font-semibold mx-auto mb-1">
            <span>🛠️ Buddy Profile Setup</span>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Set Up Your Buddy Profile</CardTitle>
          <CardDescription className="text-sm">Configure your hyperlocal service area and choose your task skills</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-bold">Full Name *</label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Rahul Verma"
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
                  placeholder="560001"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="h-11 font-mono bg-background/60"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block">Select Your Service Skills *</label>
              <div className="flex flex-wrap gap-2.5">
                {TASK_CATEGORIES.map((cat) => {
                  const isSelected = selectedSkills.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleSkill(cat.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all btn-press ${
                        isSelected
                          ? "bg-lime-400 text-black border-lime-400 shadow-sm glow-lime scale-102"
                          : "bg-background/80 text-foreground/80 border-border hover:border-lime-400/40 hover:bg-secondary/40"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-bold">Short Bio (Optional)</label>
              <Textarea
                id="bio"
                placeholder="I have 3+ years experience in home repairs and furniture assembly. Fast and punctual."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
              {loading ? "Saving Profile..." : "Next: Identity Verification →"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
