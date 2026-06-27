"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuddyOnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/kyc");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
      <div className="text-center space-y-3 animate-pulse">
        <div className="size-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to KYC verification flow...</p>
      </div>
    </div>
  );
}
