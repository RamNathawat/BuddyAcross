"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-destructive/20 text-center p-6 animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldAlert className="size-9" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            You do not have the required permissions or verified status to view this dashboard page.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 pt-4">
          <Button onClick={() => router.push("/")} className="w-full h-11">
            <ArrowLeft className="size-4 mr-2" /> Return to Homepage
          </Button>
          <Link href="/pending-approval" className="text-xs text-primary hover:underline block text-center">
            Check KYC Approval Status
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
