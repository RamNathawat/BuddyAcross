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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg border-primary/10 bg-background/80 backdrop-blur-md animate-fade-in">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Set Up Your Buddy Profile</CardTitle>
          <CardDescription>Configure your service area and skills to match with local tasks</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold">Full Name *</label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Rahul Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-semibold">City *</label>
                <Input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-semibold">State *</label>
                <Input
                  id="state"
                  type="text"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pincode" className="text-sm font-semibold">Pincode *</label>
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
                  className="h-11 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold block">Select Your Service Skills *</label>
              <div className="flex flex-wrap gap-2">
                {TASK_CATEGORIES.map((cat) => {
                  const isSelected = selectedSkills.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleSkill(cat.value)}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                          : "bg-secondary/40 text-foreground/80 border-border hover:bg-secondary"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-semibold">Short Bio (Optional)</label>
              <Textarea
                id="bio"
                placeholder="I have 3+ years experience in home repairs and furniture assembly. Fast and punctual."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? "Saving..." : "Continue to Identity Verification →"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
