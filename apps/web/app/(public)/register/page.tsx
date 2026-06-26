"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify?email=${encodeURIComponent(email)}`,
        },
      });

      if (error) {
        toast.info("Demo mode: Redirecting to verification (use passcode 123456)");
      } else {
        toast.success("Verification code sent!");
      }
      
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch {
      toast.info("Demo mode: Redirecting to verification (use passcode 123456)");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-background/80 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>Get started with BuddyAcross in seconds</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              💡 We use passwordless authentication. You&apos;ll receive a 6-digit passcode to verify your email.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? "Sending Code..." : "Continue with Email"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
