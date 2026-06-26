"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function TaskerOnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("buddy_user_id") || "00000000-0000-0000-0000-000000000001";
    const token = localStorage.getItem("buddy_auth_token") || "demo-token";

    localStorage.setItem("buddy_user_name", fullName);
    localStorage.setItem("buddy_user_phone", phone);

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
          phone,
        }),
      });
    } catch {
      // Backend offline fallback for dev/demo
    }

    toast.success("Profile saved! Welcome to BuddyAcross!");
    router.push("/tasker");
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-primary/10 bg-background/80 backdrop-blur-md animate-fade-in">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Tasker Profile</CardTitle>
          <CardDescription>Tell us your name so Buddies know who they are helping</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold">Full Name *</label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold">Phone Number (Optional)</label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Used only for urgent task coordination.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? "Saving..." : "Save & Go to Dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
