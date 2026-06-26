"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Check, X, RotateCcw, Eye, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const INITIAL_QUEUE: MockKycRecord[] = [
  {
    id: "sub_101",
    buddyName: "Rahul Verma",
    city: "Bengaluru (560001)",
    skills: ["Cleaning", "Repairs"],
    submittedAgo: "10 mins ago",
    status: "pending",
    aadhaarFront: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    aadhaarBack: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    selfie: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
  {
    id: "sub_102",
    buddyName: "Vikram Reddy",
    city: "Bengaluru (560038)",
    skills: ["Moving", "Delivery"],
    submittedAgo: "25 mins ago",
    status: "pending",
    aadhaarFront: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    aadhaarBack: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    selfie: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
  {
    id: "sub_103",
    buddyName: "Amit Patel",
    city: "Bengaluru (560010)",
    skills: ["Furniture Assembly"],
    submittedAgo: "1 hour ago",
    status: "resubmission_requested",
    notes: "Photo blurry",
    aadhaarFront: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    aadhaarBack: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    selfie: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
];

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<MockKycRecord[]>(INITIAL_QUEUE);

  const handleReview = (id: string, action: "approved" | "rejected" | "resubmission_requested") => {
    let reason = "";
    if (action === "rejected" || action === "resubmission_requested") {
      reason = window.prompt("Enter reason for rejection or resubmission request:") || "Invalid document";
      if (!reason) return;
    }

    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: action, notes: reason };
        }
        return item;
      })
    );

    // Also update buddy localStorage if Rahul Verma (for demo interactive testing across tabs)
    if (id === "sub_101") {
      localStorage.setItem("buddy_kyc_status", action);
      if (reason) localStorage.setItem("buddy_kyc_rejection_reason", reason);
    }

    toast.success(`KYC request #${id} marked as ${action.toUpperCase().replace("_", " ")}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KYC Review &amp; Approval Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Review government IDs and selfies submitted by local Buddies.</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1.5 text-xs">
          Queue Size: {queue.filter((q) => q.status === "pending").length} Pending
        </Badge>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/20 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Submissions Awaiting Audit
          </CardTitle>
          <CardDescription>Click View Documents to inspect Cloudinary encrypted images.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-secondary/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 pl-6">Buddy Details</th>
                  <th className="p-4">Service Area</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold">{item.buddyName}</div>
                      <div className="text-xs text-muted-foreground">{item.submittedAgo}</div>
                    </td>
                    <td className="p-4 font-medium">{item.city}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.skills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-normal">
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
                      <Button variant="outline" size="sm" onClick={() => window.open(item.aadhaarFront, "_blank")}>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
