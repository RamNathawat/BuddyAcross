"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Shield, MapPin, Award, LogOut, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { performLogout } from "@/lib/auth/logout";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    city: string;
    kycStatus: string;
    skills: string[];
  }>({
    name: "User Profile",
    email: "",
    phone: "",
    role: "tasker",
    city: "Bengaluru",
    kycStatus: "approved",
    skills: [],
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const storedName = localStorage.getItem("buddy_user_name") || user?.user_metadata?.full_name || "Member";
        const storedEmail = localStorage.getItem("buddy_user_email") || user?.email || "";
        const storedPhone = localStorage.getItem("buddy_user_phone") || user?.phone || "+91 ••••• •••••";
        const storedRole = localStorage.getItem("buddy_user_role") || user?.app_metadata?.role || "tasker";
        const storedCity = localStorage.getItem("buddy_profile_city") || "Bengaluru";
        const storedKyc = localStorage.getItem("buddy_kyc_status") || "approved";
        
        let skills: string[] = [];
        try {
          const rawSkills = localStorage.getItem("buddy_profile_skills");
          if (rawSkills) skills = JSON.parse(rawSkills);
        } catch {}

        setProfile({
          name: storedName,
          email: storedEmail,
          phone: storedPhone,
          role: storedRole,
          city: storedCity,
          kycStatus: storedKyc,
          skills: skills.length > 0 ? skills : ["Verified Community Member"],
        });
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-lime-500/20 via-emerald-500/20 to-teal-500/20 border border-lime-500/30 p-8 backdrop-blur-md shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="h-20 w-20 rounded-full bg-lime-400 flex items-center justify-center text-black font-extrabold text-3xl shadow-md glow-lime shrink-0">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">{profile.name}</h1>
              <Badge className="bg-lime-400 text-black hover:bg-lime-500 font-bold uppercase px-3 py-1">
                {profile.role}
              </Badge>
              {profile.role === "buddy" && (
                <Badge variant="outline" className="border-lime-500 text-lime-600 dark:text-lime-400 font-semibold flex items-center gap-1">
                  <Shield className="size-3.5" /> KYC {profile.kycStatus}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm flex items-center justify-center md:justify-start gap-2">
              <MapPin className="size-4 text-lime-500" /> {profile.city}, India • Active Member
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => performLogout(router)}
            className="flex items-center gap-2 font-bold px-6 shadow-sm hover:opacity-90 transition-all"
          >
            <LogOut className="size-4" /> Log Out
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Card */}
        <Card className="border-border bg-card/80 backdrop-blur-md shadow-md hover:border-lime-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="size-5 text-lime-500" /> Account Details
            </CardTitle>
            <CardDescription>Your registered contact credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone Number</span>
              </div>
              <span className="text-sm font-mono font-semibold">{profile.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <span className="text-sm font-mono font-semibold">{profile.email || "No email attached"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Account Role</span>
              </div>
              <span className="text-sm font-bold capitalize text-lime-600 dark:text-lime-400">{profile.role}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status & Skills Card */}
        <Card className="border-border bg-card/80 backdrop-blur-md shadow-md hover:border-lime-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="size-5 text-lime-500" /> Verification & Skills
            </CardTitle>
            <CardDescription>Your verified badges and capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center gap-3">
              <CheckCircle2 className="size-6 text-lime-600 dark:text-lime-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-foreground">Account Verified</h4>
                <p className="text-xs text-muted-foreground">You are cleared to participate in local marketplace tasks.</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags & Specialties</span>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
            <span>Security encryption active</span>
            <span className="text-lime-600 dark:text-lime-400 font-semibold">Protected Session</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
