"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Check, X, RotateCcw, Eye, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface MockKycRecord {
  id: string;
  buddyName: string;
  city: string;
  skills: string[];
  submittedAgo: string;
  status: "pending" | "approved" | "rejected" | "resubmission_requested";
  aadhaarFront: string;
  aadhaarBack: string;
  selfie: string;
  notes?: string;
}

const INITIAL_QUEUE: MockKycRecord[] = [];

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<MockKycRecord[]>(INITIAL_QUEUE);
  const [selectedDocs, setSelectedDocs] = useState<MockKycRecord | null>(null);
  const [filterTab, setFilterTab] = useState<"pending" | "reviewed" | "all">("pending");
  const supabase = createClient();
  const router = useRouter();

  const filteredQueue = queue.filter((item) => {
    if (filterTab === "pending") return item.status === "pending";
    if (filterTab === "reviewed") return item.status !== "pending";
    return true;
  });

  useEffect(() => {
    async function fetchDbKyc() {
      const { data: authData } = await supabase.auth.getUser();
      const role = authData?.user?.app_metadata?.role as string;
      if (role !== "admin") {
        toast.error("Unauthorized access");
        router.push("/unauthorized");
        return;
      }

      let loadedRecords: MockKycRecord[] = [];
      let apiSuccess = false;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) {
          const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/admin/kyc`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.data && Array.isArray(json.data)) {
              loadedRecords = json.data.map((item: any) => ({
                id: item.submission.id,
                buddyName: item.user?.fullName || item.submission?.accountHolder || "Buddy User",
                city: item.profile?.city ? (item.profile?.pincode ? `${item.profile.city} (${item.profile.pincode})` : item.profile.city) : "Location not specified",
                skills: item.profile?.skills || item.submission?.skills || ["General Service"],
                submittedAgo: item.submission?.submittedAgo || "Recently",
                status: item.submission?.status || "pending",
                aadhaarFront: item.submission?.aadhaarFront || "",
                aadhaarBack: item.submission?.aadhaarBack || "",
                selfie: item.submission?.selfie || "",
                notes: item.submission?.rejectionReason || "",
              }));
              apiSuccess = true;
            }
          }
        }
      } catch (err) {
        // Silently fall back to direct database query when Express server is unreachable
      }

      // Fall back to direct Supabase database query
      if (!apiSuccess || loadedRecords.length === 0) {
        try {
          const { data: dbSubmissions } = await supabase
            .from("kyc_submissions")
            .select("*")
            .order("submitted_at", { ascending: false });

          if (dbSubmissions && Array.isArray(dbSubmissions) && dbSubmissions.length > 0) {
            const buddyIds = Array.from(new Set(dbSubmissions.map((s) => s.buddy_id).filter(Boolean)));
            const { data: profiles } = buddyIds.length > 0
              ? await supabase.from("buddy_profiles").select("*").in("id", buddyIds)
              : { data: [] };

            const userIds = Array.from(new Set((profiles || []).map((p) => p.user_id).filter(Boolean)));
            const { data: usersList } = userIds.length > 0
              ? await supabase.from("users").select("*").in("id", userIds)
              : { data: [] };

            const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
            const userMap = new Map((usersList || []).map((u) => [u.id, u]));

            const dbRecords: MockKycRecord[] = dbSubmissions.map((sub: any) => {
              const prof = profileMap.get(sub.buddy_id);
              const u = prof ? userMap.get(prof.user_id) : null;
              const location = prof?.city ? (prof.pincode ? `${prof.city} (${prof.pincode})` : prof.city) : "Location not specified";
              return {
                id: sub.id,
                buddyName: u?.full_name || sub.account_holder || "Buddy User",
                city: location,
                skills: sub.skills || prof?.skills || ["General Service"],
                submittedAgo: sub.submitted_ago || "Recently",
                status: sub.status || "pending",
                aadhaarFront: sub.aadhaar_front || "",
                aadhaarBack: sub.aadhaar_back || "",
                selfie: sub.selfie || "",
                notes: sub.rejection_reason || "",
              };
            });

            for (const rec of dbRecords) {
              if (!loadedRecords.some((r) => r.id === rec.id)) {
                loadedRecords.push(rec);
              }
            }
          }
        } catch (dbErr) {
          console.error("Supabase fallback fetch error:", dbErr);
        }
      }

      // Sync with localStorage for live demo submissions
      try {
        const localStr = localStorage.getItem("buddy_live_kyc_submission");
        if (localStr) {
          const localRecord = JSON.parse(localStr);
          const localStatus = (localStorage.getItem("buddy_kyc_status") as any) || localRecord.status || "pending";
          const updatedLocal = {
            ...localRecord,
            status: localStatus,
            notes: localStorage.getItem("buddy_kyc_rejection_reason") || localRecord.notes || "",
          };
          const existingIdx = loadedRecords.findIndex((r) => r.id === updatedLocal.id);
          if (existingIdx >= 0) {
            loadedRecords[existingIdx] = updatedLocal;
          } else {
            loadedRecords.unshift(updatedLocal);
          }
        }
      } catch {}

      setQueue(loadedRecords);
    }
    fetchDbKyc();
  }, [router, supabase]);

  const handleReview = async (id: string, action: "approved" | "rejected" | "resubmission_requested") => {
    let reason = "";
    if (action === "rejected" || action === "resubmission_requested") {
      reason = window.prompt("Enter reason for rejection or resubmission request:") || "Invalid document";
      if (!reason) return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/admin/kyc/${id}/review`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: action,
              rejectionReason: reason || undefined,
            }),
          });
        } catch {}
      }

      // Update Supabase DB directly
      try {
        await supabase
          .from("kyc_submissions")
          .update({
            status: action,
            rejection_reason: reason || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);

        const { data: subRow } = await supabase.from("kyc_submissions").select("buddy_id").eq("id", id).maybeSingle();
        if (subRow?.buddy_id) {
          await supabase.from("buddy_profiles").update({ kyc_status: action }).eq("id", subRow.buddy_id);
        }
      } catch {}

      // Update localStorage if testing live demo submission
      try {
        const localStr = localStorage.getItem("buddy_live_kyc_submission");
        if (localStr) {
          const localRec = JSON.parse(localStr);
          if (localRec.id === id || id.startsWith("demo-")) {
            localStorage.setItem("buddy_kyc_status", action);
            if (reason) localStorage.setItem("buddy_kyc_rejection_reason", reason);
          }
        }
      } catch {}

      setQueue((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: action, notes: reason };
          }
          return item;
        })
      );

      toast.success(`KYC request #${id} marked as ${action.toUpperCase().replace("_", " ")}`);
      if (selectedDocs?.id === id) setSelectedDocs(null);
    } catch (err) {
      toast.error("Error submitting review action.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto relative">
      {/* Document Inspector Modal */}
      {selectedDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="size-5 text-primary" /> KYC Documents: {selectedDocs.buddyName}
                </h3>
                <p className="text-sm text-muted-foreground">ID: #{selectedDocs.id} • Submitted: {selectedDocs.submittedAgo}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDocs(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 border rounded-xl p-3 bg-secondary/10">
                <p className="font-semibold text-sm text-center">1. Aadhaar Card (Front)</p>
                <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border flex items-center justify-center">
                  <img src={selectedDocs.aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-2 border rounded-xl p-3 bg-secondary/10">
                <p className="font-semibold text-sm text-center">2. Aadhaar Card (Back)</p>
                <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border flex items-center justify-center">
                  <img src={selectedDocs.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-2 border rounded-xl p-3 bg-secondary/10">
                <p className="font-semibold text-sm text-center">3. Live Selfie</p>
                <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border flex items-center justify-center">
                  <img src={selectedDocs.selfie} alt="Selfie" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedDocs(null)}>Close Inspector</Button>
              {selectedDocs.status !== "approved" && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(selectedDocs.id, "approved")}>
                  <Check className="size-4 mr-1.5" /> Approve KYC
                </Button>
              )}
              {selectedDocs.status !== "rejected" && (
                <Button variant="destructive" onClick={() => handleReview(selectedDocs.id, "rejected")}>
                  <X className="size-4 mr-1.5" /> Reject KYC
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Trust & Safety Audit Queue</h1>
          <p className="text-muted-foreground text-sm">
            Review government Aadhaar verification documents submitted by local Buddies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium bg-secondary/30">
            <ShieldCheck className="size-4 mr-1.5 text-primary" />
            24/7 Monitoring Active
          </Badge>
        </div>
      </div>

      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="bg-secondary/20 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">KYC Review & Approval Queue</CardTitle>
              <CardDescription>Review government IDs and selfies submitted by local Buddies.</CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">Pending Review: {queue.filter(q => q.status === "pending").length}</Badge>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant={filterTab === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilterTab("pending")}>
              Pending Review ({queue.filter(q => q.status === "pending").length})
            </Button>
            <Button variant={filterTab === "reviewed" ? "default" : "outline"} size="sm" onClick={() => setFilterTab("reviewed")}>
              Reviewed / Actioned ({queue.filter(q => q.status !== "pending").length})
            </Button>
            <Button variant={filterTab === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterTab("all")}>
              All Records ({queue.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 bg-blue-500/10 border-b flex items-center gap-3 text-blue-800 dark:text-blue-300 text-sm">
            <FileText className="size-4 shrink-0" />
            <span>Click <strong>Docs</strong> to launch interactive document inspector for Cloudinary encrypted images.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-secondary/10 text-xs text-muted-foreground font-medium">
                  <th className="p-4 pl-6">BUDDY DETAILS</th>
                  <th className="p-4">SERVICE AREA</th>
                  <th className="p-4">SKILLS</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right pr-6">AUDIT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <ShieldCheck className="size-10 mx-auto mb-3 text-primary/40" />
                      <p className="font-semibold text-base text-foreground">
                        {filterTab === "pending" ? "All caught up! No pending KYC requests." : "No KYC records found in this view."}
                      </p>
                      <p className="text-xs mt-1">When submissions arrive or get reviewed, they will appear here live.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 pl-6 font-medium">
                        <div className="font-bold text-foreground">{item.buddyName}</div>
                        <div className="text-xs text-muted-foreground">{item.submittedAgo}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.city}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {item.skills.map((s, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0 font-normal">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {item.status === "pending" && <Badge variant="warning">Pending</Badge>}
                        {item.status === "approved" && <Badge variant="success">Approved</Badge>}
                        {item.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                        {item.status === "resubmission_requested" && <Badge variant="destructive">Resubmit</Badge>}
                        {item.notes && <p className="text-xs text-destructive mt-1">Note: {item.notes}</p>}
                      </td>
                      <td className="p-4 text-right pr-6 space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDocs(item)}>
                          <Eye className="size-3.5 mr-1" /> Docs
                        </Button>
                        
                        {item.status !== "approved" && (
                          <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleReview(item.id, "approved")}>
                            <Check className="size-3.5 mr-1" /> Approve
                          </Button>
                        )}

                        {item.status !== "rejected" && (
                          <Button variant="destructive" size="sm" onClick={() => handleReview(item.id, "rejected")}>
                            <X className="size-3.5 mr-1" /> Reject
                          </Button>
                        )}

                        {item.status !== "resubmission_requested" && (
                          <Button variant="secondary" size="sm" onClick={() => handleReview(item.id, "resubmission_requested")}>
                            <RotateCcw className="size-3.5 mr-1" /> Resubmit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
