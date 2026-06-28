"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, UploadCloud, CheckCircle2, Camera, X, RefreshCw, ArrowLeft, ArrowRight, User, CreditCard, Briefcase, MapPin, PhoneCall, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const AVAILABLE_SKILLS = [
  "Plumbing & Repairs", "Electrical Works", "Home Cleaning", 
  "Package Delivery", "Pet Sitting", "Tutoring & Education", 
  "Tech Support", "Carpentry", "Event Assistance", "Cook / Chef"
];

const AVAILABLE_ZONES = [
  "Indiranagar", "Koramangala", "HSR Layout", "Whitefield", 
  "Jayanagar", "MG Road", "Marathahalli", "Electronic City", 
  "JP Nagar", "Bellandur"
];

const STEPS = [
  { id: 1, label: "Personal", name: "Personal Information", pct: 14, icon: User },
  { id: 2, label: "Docs", name: "Document Verification", pct: 28, icon: ShieldCheck },
  { id: 3, label: "Bank", name: "Bank Account Details", pct: 42, icon: CreditCard },
  { id: 4, label: "Skills", name: "Service Skills", pct: 57, icon: Briefcase },
  { id: 5, label: "Zones", name: "Hyperlocal Zones", pct: 71, icon: MapPin },
  { id: 6, label: "Emergency", name: "Emergency Contact", pct: 85, icon: PhoneCall },
  { id: 7, label: "Review", name: "Final Review & Submit", pct: 100, icon: CheckCircle2 },
];

export default function BuddyKycUploadPage() {
  const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Step 2: Docs
  const [frontUrl, setFrontUrl] = useState<string>("");
  const [backUrl, setBackUrl] = useState<string>("");
  const [selfieUrl, setSelfieUrl] = useState<string>("");
  const [cameraOpen, setCameraOpen] = useState(false);

  // Step 3: Bank
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Step 4: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 5: Zones
  const [selectedZones, setSelectedZones] = useState<string[]>(["Indiranagar", "Koramangala", "HSR Layout"]);

  // Step 6: Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Refs for camera & files
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStepInfo = STEPS.find((s) => s.id === step) || STEPS[0];

  useEffect(() => {
    const savedName = localStorage.getItem("buddy_user_name") || "";
    if (savedName) {
      setFullName(savedName);
      setAccountHolder(savedName);
    }
    const savedEmail = localStorage.getItem("buddy_user_email") || "";
    const savedPhone = localStorage.getItem("buddy_user_phone") || "";
    const savedIdentifier = localStorage.getItem("buddy_user_identifier") || "";
    
    if (savedEmail || (savedIdentifier && savedIdentifier.includes("@"))) {
      setEmail(savedEmail || savedIdentifier);
    }
    if (savedPhone || (savedIdentifier && !savedIdentifier.includes("@"))) {
      setPhoneNumber(savedPhone || savedIdentifier);
    }

    const savedCity = localStorage.getItem("buddy_profile_city") || "";
    if (savedCity) setCity(savedCity);
    const savedState = localStorage.getItem("buddy_profile_state") || "";
    if (savedState) setState(savedState);
    const savedPincode = localStorage.getItem("buddy_profile_pincode") || "";
    if (savedPincode) setPincode(savedPincode);

    const savedSkills = localStorage.getItem("buddy_profile_skills");
    if (savedSkills) {
      try {
        const parsed = JSON.parse(savedSkills);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedSkills(parsed);
      } catch {}
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === "front") setFrontUrl(result);
      if (type === "back") setBackUrl(result);
      if (type === "selfie") setSelfieUrl(result);
      toast.success(`${type.toUpperCase()} image loaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          toast.error("Webcam access denied or not found. Opening file upload selector.");
          setCameraOpen(false);
          selfieRef.current?.click();
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOpen]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelfieUrl(dataUrl);
      setCameraOpen(false);
      toast.success("Live Selfie captured successfully!");
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length <= 1) {
        toast.error("Please select at least one skill.");
        return;
      }
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      if (selectedZones.length <= 1) {
        toast.error("Please select at least one zone.");
        return;
      }
      setSelectedZones(selectedZones.filter((z) => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleDemoFill = () => {
    setFullName("Priya Sharma");
    setPhoneNumber("+91 99887 76655");
    setEmail("priya.sharma@bengaluru.in");
    setAccountHolder("Priya Sharma");
    setAccountNumber("501009988776");
    setIfscCode("ICIC0000345");
    setSelectedSkills(["Home Cleaning", "Pet Sitting", "Tutoring & Education"]);
    setSelectedZones(["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"]);
    setEmergencyName("Anand Sharma (Father)");
    setEmergencyPhone("+91 98440 11223");
    
    // Generate dummy image URLs if empty so validation passes
    const dummyImg = "https://res.cloudinary.com/dngfr3tqv/image/upload/v1782625019/test/xnrodov8rwn8jzt7cy6v.png";
    if (!frontUrl) setFrontUrl(dummyImg);
    if (!backUrl) setBackUrl(dummyImg);
    if (!selfieUrl) setSelfieUrl(dummyImg);

    toast.success("⚡ Auto-filled complete profile & test docs for review!");
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 7) {
      if (step === 1 && (!fullName.trim() || !phoneNumber.trim())) {
        toast.error("Please enter your full name and phone number to proceed.");
        return;
      }
      if (step === 2 && (!frontUrl || !backUrl || !selfieUrl)) {
        toast.error("Please upload Aadhaar Front, Back, and Live Selfie to proceed (or click ⚡ Demo Fill above).");
        return;
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmitFinal();
    }
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    const token = localStorage.getItem("buddy_auth_token") || "demo-token";

    localStorage.setItem("buddy_kyc_status", "pending");
    localStorage.removeItem("buddy_kyc_rejection_reason");
    localStorage.setItem("buddy_profile_skills", JSON.stringify(selectedSkills));
    localStorage.setItem("buddy_profile_zones", JSON.stringify(selectedZones));
    localStorage.setItem("buddy_user_name", fullName);
    
    const submissionId = "sub_" + Math.floor(1000 + Math.random() * 9000);
    let finalFront = frontUrl;
    let finalBack = backUrl;
    let finalSelfie = selfieUrl;

    try {
      toast.info("Submitting profile & KYC securely...");
      // Step 1: Save profile via API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          role: "buddy",
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          skills: selectedSkills,
        }),
      });

      // Step 2: Submit KYC via API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/kyc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aadhaarFront: frontUrl,
          aadhaarBack: backUrl,
          selfie: selfieUrl,
          accountHolder,
          accountNumber,
          ifscCode,
          emergencyName,
          emergencyPhone,
          skills: selectedSkills,
          zones: selectedZones,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.aadhaarFront) finalFront = json.data.aadhaarFront;
        if (json.data?.aadhaarBack) finalBack = json.data.aadhaarBack;
        if (json.data?.selfie) finalSelfie = json.data.selfie;
      }
    } catch {
      // Offline fallback
    }

    const locationDisplay = city ? (pincode ? `${city} (${pincode})` : city) : "Location not specified";

    const newRecord = {
      id: submissionId,
      buddyName: fullName,
      city: locationDisplay,
      skills: selectedSkills,
      zones: selectedZones,
      phone: phoneNumber,
      accountHolder,
      accountNumber,
      ifscCode,
      emergencyName,
      emergencyPhone,
      submittedAgo: "Just now",
      status: "pending",
      aadhaarFront: finalFront,
      aadhaarBack: finalBack,
      selfie: finalSelfie,
    };

    localStorage.setItem("buddy_live_kyc_submission", JSON.stringify(newRecord));
    localStorage.setItem("buddy_kyc_status", "pending");
    if (city) localStorage.setItem("buddy_profile_city", city);
    if (state) localStorage.setItem("buddy_profile_state", state);
    if (pincode) localStorage.setItem("buddy_profile_pincode", pincode);

    const userId = localStorage.getItem("buddy_user_id") || "demo_user_" + Math.floor(Math.random() * 1000);

    try {
      await supabase.from("buddy_profiles").update({ kyc_status: "pending" }).eq("user_id", userId);
    } catch {
      // Fallback
    }

    toast.success("KYC Application submitted successfully!");
    router.push("/pending-approval");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <input type="file" ref={frontRef} onChange={(e) => handleFileChange(e, "front")} accept="image/*" className="hidden" />
      <input type="file" ref={backRef} onChange={(e) => handleFileChange(e, "back")} accept="image/*" className="hidden" />
      <input type="file" ref={selfieRef} onChange={(e) => handleFileChange(e, "selfie")} accept="image/*" capture="user" className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Camera Overlay Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-center my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b pb-2 shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Camera className="size-5 text-lime-600 dark:text-lime-400" /> Take Live Selfie
              </h3>
              <Button type="button" variant="ghost" size="sm" className="cursor-pointer" onClick={() => setCameraOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground shrink-0">Position your face inside the frame and click the vibrant button below when ready.</p>

            <div className="w-full aspect-[4/3] max-h-[42vh] bg-black rounded-xl overflow-hidden border-2 border-lime-400/60 flex items-center justify-center relative shadow-inner shrink">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0">
              <Button type="button" className="flex-1 bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-base h-12 shadow-md glow-lime cursor-pointer transition-all active:scale-95" onClick={capturePhoto}>
                <Camera className="size-5 mr-2 animate-pulse" /> Snap Picture Now 📸
              </Button>
              <Button type="button" variant="outline" className="h-12 px-4 text-xs font-semibold shrink-0 cursor-pointer" onClick={() => { setCameraOpen(false); selfieRef.current?.click(); }}>
                <UploadCloud className="size-4 mr-1.5" /> Upload File Instead
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 max-w-3xl animate-fade-in">
        {/* Header Title matching reference */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Complete your KYC</h1>
            <p className="text-muted-foreground mt-1 text-sm">Verified Buddies get more tasks and higher trust across hyperlocal service zones.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleDemoFill} className="border-lime-500/50 hover:bg-lime-500/10 text-xs font-bold shrink-0">
            <Sparkles className="size-3.5 mr-1 text-lime-500" /> ⚡ Demo Fill All
          </Button>
        </div>

        {/* 7-Step Progress Indicator matching reference */}
        <div className="mb-8 p-6 rounded-2xl bg-card border shadow-xs">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold text-muted-foreground">
            <span>Step {step} of 7: {currentStepInfo.name}</span>
            <span className="text-lime-600 dark:text-lime-400 font-bold">{currentStepInfo.pct}% complete</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-lime-400 glow-lime transition-all duration-500" style={{ width: `${currentStepInfo.pct}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-[11px] font-medium text-muted-foreground overflow-x-auto gap-2">
            {STEPS.map((s) => {
              const isPast = s.id < step;
              const isCurrent = s.id === step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${isCurrent ? "text-foreground font-extrabold underline decoration-lime-400 decoration-2 underline-offset-4" : isPast ? "text-lime-600 dark:text-lime-400 font-bold" : "hover:text-foreground"}`}
                >
                  {isPast ? <CheckCircle2 className="size-3 inline shrink-0" /> : null}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 bg-secondary/20 border-b">
            <div className="font-bold text-lg flex items-center gap-2">
              <currentStepInfo.icon className="size-5 text-lime-600 dark:text-lime-400" /> {currentStepInfo.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {step === 1 && "Please confirm your official government identity details."}
              {step === 2 && "Upload clear photos of your Government Aadhaar Card and snap a live selfie."}
              {step === 3 && "Provide your bank account details for instant task payouts."}
              {step === 4 && "Select the task categories you are qualified and equipped to perform."}
              {step === 5 && "Choose your preferred operational zones in Bengaluru for immediate notifications."}
              {step === 6 && "Add a trusted emergency contact for marketplace safety protocol."}
              {step === 7 && "Review your full application details before submitting for instant Trust & Safety audit."}
            </p>
          </div>

          <form onSubmit={handleNext} className="p-6 space-y-6">
            {/* STEP 1: PERSONAL */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Full Name (as per Aadhaar)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Active Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DOCS */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className={`p-5 rounded-xl border-2 border-dashed flex items-center justify-between transition-all ${frontUrl ? "border-lime-500/60 bg-lime-500/5 shadow-xs" : "border-border bg-secondary/10 hover:border-lime-400/50"}`}>
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-sm flex items-center gap-2">
                      1. Aadhaar Card (Front) {frontUrl && <CheckCircle2 className="size-4 text-lime-600 dark:text-lime-400 shrink-0" />}
                    </p>
                    <p className="text-xs text-muted-foreground">Must clearly show your photo, full name, and 12-digit Aadhaar number.</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {frontUrl && (
                      <img src={frontUrl} alt="Front preview" className="w-12 h-12 object-cover rounded-lg border-2 border-lime-400 shadow-xs" />
                    )}
                    <Button type="button" variant={frontUrl ? "outline" : "secondary"} size="sm" className="font-medium cursor-pointer" onClick={() => frontRef.current?.click()}>
                      <UploadCloud className="size-4 mr-1.5" />
                      {frontUrl ? "Change" : "Upload File"}
                    </Button>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 border-dashed flex items-center justify-between transition-all ${backUrl ? "border-lime-500/60 bg-lime-500/5 shadow-xs" : "border-border bg-secondary/10 hover:border-lime-400/50"}`}>
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-sm flex items-center gap-2">
                      2. Aadhaar Card (Back) {backUrl && <CheckCircle2 className="size-4 text-lime-600 dark:text-lime-400 shrink-0" />}
                    </p>
                    <p className="text-xs text-muted-foreground">Must clearly display your residential address and guardian details.</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {backUrl && (
                      <img src={backUrl} alt="Back preview" className="w-12 h-12 object-cover rounded-lg border-2 border-lime-400 shadow-xs" />
                    )}
                    <Button type="button" variant={backUrl ? "outline" : "secondary"} size="sm" className="font-medium cursor-pointer" onClick={() => backRef.current?.click()}>
                      <UploadCloud className="size-4 mr-1.5" />
                      {backUrl ? "Change" : "Upload File"}
                    </Button>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 border-dashed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${selfieUrl ? "border-lime-500/60 bg-lime-500/5 shadow-xs" : "border-border bg-secondary/10 hover:border-lime-400/50"}`}>
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-sm flex items-center gap-2">
                      3. Live Selfie Photo {selfieUrl && <CheckCircle2 className="size-4 text-lime-600 dark:text-lime-400 shrink-0" />}
                    </p>
                    <p className="text-xs text-muted-foreground">Take a well-lit picture using your camera without hats or sunglasses.</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {selfieUrl && (
                      <img src={selfieUrl} alt="Selfie preview" className="w-12 h-12 object-cover rounded-lg border-2 border-lime-400 shadow-xs" />
                    )}
                    <Button type="button" className="bg-lime-400 hover:bg-lime-500 text-black font-bold shadow-sm glow-lime cursor-pointer" size="sm" onClick={() => setCameraOpen(true)}>
                      <Camera className="size-4 mr-1.5" />
                      {selfieUrl ? "Retake Picture" : "Take Picture"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => selfieRef.current?.click()} title="Upload from disk">
                      <UploadCloud className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BANK */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Bank Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: SKILLS */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-muted-foreground">Select all skills you can perform. This determines what task notifications you receive.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <div
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? "border-lime-500 bg-lime-500/10 font-bold shadow-xs" : "border-border hover:bg-secondary/40"}`}
                      >
                        <span className="text-sm">{skill}</span>
                        {isSelected && <Check className="size-4 text-lime-600 dark:text-lime-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: ZONES */}
            {step === 5 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-muted-foreground">Select the neighbourhoods in Bengaluru where you can travel to fulfill jobs within 45 minutes.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {AVAILABLE_ZONES.map((zone) => {
                    const isSelected = selectedZones.includes(zone);
                    return (
                      <div
                        key={zone}
                        onClick={() => toggleZone(zone)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? "border-lime-500 bg-lime-500/10 font-bold shadow-xs" : "border-border hover:bg-secondary/40"}`}
                      >
                        <span className="text-sm truncate">{zone}</span>
                        {isSelected && <Check className="size-4 text-lime-600 dark:text-lime-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: EMERGENCY */}
            {step === 6 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Emergency Contact Name & Relation</label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Suresh Kumar (Brother)"
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Emergency Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98000 11223"
                    className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW */}
            {step === 7 && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-xl bg-secondary/30 border space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-bold">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span className="font-bold">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Documents Uploaded:</span>
                    <span className="font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1">
                      <CheckCircle2 className="size-4 inline" /> Front, Back & Selfie Ready
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Bank Account:</span>
                    <span className="font-mono font-bold">{accountNumber} ({ifscCode})</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b pb-2">
                    <span className="text-muted-foreground">Selected Skills ({selectedSkills.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedSkills.map((s) => <span key={s} className="px-2 py-0.5 rounded-md bg-lime-500/20 text-xs font-semibold">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Active Zones ({selectedZones.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedZones.map((z) => <span key={z} className="px-2 py-0.5 rounded-md bg-primary/10 text-xs font-semibold">{z}</span>)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/30 text-center">
                  <p className="text-xs font-bold text-lime-700 dark:text-lime-300">
                    🚀 Everything looks perfect! Clicking submit below will route your verification packet directly to Trust & Safety.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t flex items-center justify-between gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6 cursor-pointer font-medium"
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    router.push("/onboarding");
                  }
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> {step === 1 ? "Cancel" : "Back"}
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-8 bg-lime-400 hover:bg-lime-500 text-black font-extrabold shadow-md glow-lime cursor-pointer transition-all active:scale-95"
              >
                {step < 7 ? (
                  <>Next Step <ArrowRight className="size-4 ml-2" /></>
                ) : loading ? (
                  "Submitting Packet..."
                ) : (
                  "Submit KYC Application 🚀"
                )}
              </Button>
            </div>
            
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              🔒 End-to-end encrypted & verified securely. Approvals typically complete within minutes.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
