import React, { useState, useEffect } from "react";
import { User, Shield, Briefcase, Key, Bell, HelpCircle, Terminal, RefreshCw, Layers, Sparkles, LogOut, CheckCircle2, Loader2, BarChart3 } from "lucide-react";
import { Candidate, PortalCredential, RealJob, ManualReviewQueueItem, AnswerBankEntry, ApplicationLog, AppNotification } from "./types";
import CandidateSelector from "./components/CandidateSelector";
import CandidateProfile from "./components/CandidateProfile";
import PortalManager from "./components/PortalManager";
import JobScraper from "./components/JobScraper";
import AnswerBank from "./components/AnswerBank";
import ReviewQueue from "./components/ReviewQueue";
import LogsAndNotifications from "./components/LogsAndNotifications";
import DashboardStats from "./components/DashboardStats";
import SummaryReports from "./components/SummaryReports";

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [credentials, setCredentials] = useState<PortalCredential[]>([]);
  const [jobs, setJobs] = useState<RealJob[]>([]);
  const [manualReviews, setManualReviews] = useState<ManualReviewQueueItem[]>([]);
  const [answerBank, setAnswerBank] = useState<AnswerBankEntry[]>([]);
  const [logs, setLogs] = useState<ApplicationLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [viewRole, setViewRole] = useState<"admin" | "candidate">("admin");
  const [activeTab, setActiveTab] = useState<"profile" | "portals" | "jobs" | "answerBank" | "manualReviews" | "logs" | "reports">("profile");
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with REST Express DB
  const loadDatabase = async () => {
    try {
      const res = await fetch("/api/db");
      const db = await res.json();
      setCandidates(db.candidates);
      setCredentials(db.credentials);
      setJobs(db.jobs);
      setManualReviews(db.manualReviews);
      setAnswerBank(db.answerBank);
      setLogs(db.logs);
      setNotifications(db.notifications);

      // Select first candidate by default if none selected or invalid
      if (db.candidates.length > 0) {
        if (!selectedCandidateId || !db.candidates.some((c: any) => c.id === selectedCandidateId)) {
          setSelectedCandidateId(db.candidates[0].id);
        }
      }
    } catch (err) {
      console.error("Database fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
    // Poll updates every 6 seconds for live simulated logs/statuses
    const interval = setInterval(loadDatabase, 6000);
    return () => clearInterval(interval);
  }, [selectedCandidateId]);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("asia-southeast1.run.app")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        await loadDatabase();
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidateId(id);
  };

  // ADD Candidate API call
  const handleAddCandidate = async (newCand: Omit<Candidate, "id">) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCand)
      });
      const parsed = await res.json();
      setSelectedCandidateId(parsed.id);
      await loadDatabase();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE Candidate profile parameters
  const handleUpdateCandidate = async (updated: Candidate) => {
    try {
      const res = await fetch(`/api/candidates/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE Candidate parameters
  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Are you sure you want to remove this candidate's entire files?")) return;
    setIsLoading(true);
    try {
      await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE portal configuration details
  const handleUpdatePortal = async (portalId: string, updatedFields: Partial<PortalCredential>) => {
    try {
      await fetch(`/api/candidates/${selectedCandidateId}/portals/${portalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // TRIGGER Portal connection verification
  const handleVerifyPortal = async (portalId: string) => {
    try {
      const res = await fetch(`/api/candidates/${selectedCandidateId}/portals/${portalId}/verify`, {
        method: "POST"
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // SUBMIT MFA OTP Verification Code override
  const handleSubmitOtp = async (portalId: string, code: string) => {
    try {
      const res = await fetch(`/api/candidates/${selectedCandidateId}/portals/${portalId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: code })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "OTP code verification failed");
      }
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // SUBMIT CAPTCHA solution string
  const handleSubmitCaptcha = async (portalId: string, solution: string) => {
    try {
      const res = await fetch(`/api/candidates/${selectedCandidateId}/portals/${portalId}/verify-captcha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeSolution: solution })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Captcha solution failed");
      }
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // TRIGGER Scraper on verified sites
  const handleScrapeJobs = async () => {
    try {
      const res = await fetch(`/api/candidates/${selectedCandidateId}/scrape`, {
        method: "POST"
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Scraping failed");
      }
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // TRIGGER Auto Apply submitted algorithm
  const handleApplyJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Auto Apply setup failed.");
      } else {
        if (data.status === "manual_review") {
          setActiveTab("manualReviews"); // auto focus review tabs immediately
        }
      }
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // RESOLVE manual review blocking question
  const handleResolveReview = async (reviewId: string, answerText: string, saveToBank: boolean, questionKey?: string) => {
    try {
      await fetch(`/api/manual-reviews/${reviewId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerText, saveToBank, questionKey })
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // ADD / UPDATE custom Answers bank Entries
  const handleUpdateAnswerBank = async (entry: Omit<AnswerBankEntry, "candidateId" | "id"> & { id?: string }) => {
    try {
      await fetch(`/api/candidates/${selectedCandidateId}/answer-bank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE Answer bank Entry
  const handleDeleteAnswerBank = async (id: string) => {
    try {
      await fetch(`/api/candidates/${selectedCandidateId}/answer-bank/${id}`, {
        method: "DELETE"
      });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // MARK Notification center Alert read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      await loadDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // DYNAMIC Gemini PDF / Text Resume Parsing triggers
  const handleParseResume = async (resumeText: string, filename: string) => {
    try {
      const res = await fetch(`/api/candidates/${selectedCandidateId}/resume/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, resumeFilename: filename })
      });
      const parsed = await res.json();
      await loadDatabase();
      return parsed.candidate;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Variables
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;
  const currentCredentials = credentials.filter((c) => c.candidateId === selectedCandidateId);
  const currentJobs = jobs.filter((j) => j.candidateId === selectedCandidateId);
  const currentReviews = manualReviews.filter((r) => r.candidateId === selectedCandidateId);
  const currentAnswerBank = answerBank.filter((ab) => ab.candidateId === selectedCandidateId);
  const currentNotifications = notifications.filter((n) => n.candidateId === selectedCandidateId);
  const currentLogs = logs.filter((l) => l.candidateId === selectedCandidateId);

  return (
    <div className="min-h-screen bg-slate-100/40 text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col antialiased">
      
      {/* Top Static Title Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 py-3.5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-950 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold text-slate-950 tracking-tight font-sans">
              Gateway Verified Apply Portal
            </h1>
            <p className="text-[10px] text-slate-500 font-sans leading-none mt-1">
              Multi-Candidate secure account synchronization & automation suite
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            id="global-database-refresh"
            onClick={loadDatabase}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors"
            title="Force Sync State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <div className="text-[10.5px] uppercase font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Agent cluster: active
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7.5xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Rail Column 1: Selector listing switches */}
        <div className="lg:col-span-1 space-y-4">
          <CandidateSelector
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={handleSelectCandidate}
            onAddCandidate={handleAddCandidate}
          />

          {selectedCandidate && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-3 font-sans">
              <h3 className="font-bold text-slate-900">Active Profile Operations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Main domain:</span>
                  <span className="font-semibold text-slate-800">{selectedCandidate.domain || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expects:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={selectedCandidate.salaryExpectation}>
                    {selectedCandidate.salaryExpectation || "TBD"}
                  </span>
                </div>
              </div>
              <button
                id="btn-remove-candidate-module"
                type="button"
                onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                className="w-full py-1.5 text-center text-[11px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Delete Selected Profile
              </button>
            </div>
          )}
        </div>

        {/* Workspace Column: Primary Dashboard and tabs control flows */}
        <div className="lg:col-span-3 space-y-5">
          
          {selectedCandidate ? (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Perspective Stats Section */}
              <DashboardStats
                candidateId={selectedCandidate.id}
                candidateName={selectedCandidate.name}
                credentials={credentials}
                jobs={jobs}
                reviews={manualReviews}
                vRole={viewRole}
                onToggleRole={setViewRole}
              />

              {/* Tabs selector */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-0.5">
                {[
                  { id: "profile", label: "Candidate Profile Setup", icon: User },
                  { id: "portals", label: "Credentials Manager", icon: Shield },
                  { id: "jobs", label: "Matched Grounded Jobs", icon: Briefcase },
                  { id: "answerBank", label: "Answer Bank (FAQs)", icon: Key },
                  { id: "manualReviews", label: "Manual Exceptions Queue", icon: HelpCircle, badges: currentReviews.length },
                  { id: "logs", label: "Shadow Logs Center", icon: Terminal },
                  { id: "reports", label: "Summary Reports (M-5)", icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      id={`tab-btn-${tab.id}`}
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2.5 px-4 font-sans font-semibold text-xs border-b-2 text-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? "border-slate-950 text-slate-950"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {tab.badges !== undefined && tab.badges > 0 && (
                        <span className="bg-rose-500 text-white rounded-full text-[9px] px-1.5 py-0.5 min-w-[16px] text-center font-bold font-sans">
                          {tab.badges}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab views switcher panels */}
              <div className="transition-all duration-200">
                {activeTab === "profile" && (
                  <CandidateProfile
                    candidate={selectedCandidate}
                    onUpdateCandidate={handleUpdateCandidate}
                    onParseResume={handleParseResume}
                    answerBank={currentAnswerBank}
                  />
                )}

                {activeTab === "portals" && (
                  <PortalManager
                    candidateId={selectedCandidateId}
                    credentials={currentCredentials}
                    onUpdatePortal={handleUpdatePortal}
                    onVerifyPortal={handleVerifyPortal}
                    onSubmitOtp={handleSubmitOtp}
                    onSubmitCaptcha={handleSubmitCaptcha}
                  />
                )}

                {activeTab === "jobs" && (
                  <JobScraper
                    candidate={selectedCandidate}
                    credentials={currentCredentials}
                    jobs={jobs}
                    onScrapeJobs={handleScrapeJobs}
                    onApplyJob={handleApplyJob}
                    logs={currentLogs}
                  />
                )}

                {activeTab === "answerBank" && (
                  <AnswerBank
                    candidateId={selectedCandidate.id}
                    entries={currentAnswerBank}
                    onAddOrUpdateEntry={handleUpdateAnswerBank}
                    onDeleteEntry={handleDeleteAnswerBank}
                  />
                )}

                {activeTab === "manualReviews" && (
                  <ReviewQueue
                    reviews={currentReviews}
                    onResolveReview={handleResolveReview}
                  />
                )}

                {activeTab === "logs" && (
                  <LogsAndNotifications
                    candidateId={selectedCandidate.id}
                    logs={currentLogs}
                    notifications={currentNotifications}
                    onMarkNotificationRead={handleMarkNotifRead}
                  />
                )}

                {activeTab === "reports" && (
                  <SummaryReports
                    candidates={candidates}
                    jobs={jobs}
                    credentials={credentials}
                    logs={logs}
                  />
                )}
              </div>

            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-200 rounded-3xl bg-white flex flex-col justify-center items-center text-center p-6 space-y-2">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
              <h3 className="font-semibold text-slate-700 text-sm">Synchronizing profiles</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No custom candidates loaded yet. Use the side column controls to initialize a new setup module.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* Sleek human proof footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-between text-[11px] text-slate-400 font-sans mt-auto">
        <span>Verified Apply Automation Engine Framework • v2.1</span>
        <span>Secure authentication handshakes are compiled natively via Node TLS.</span>
      </footer>

    </div>
  );
}
