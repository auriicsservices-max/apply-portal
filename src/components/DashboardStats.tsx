import React from "react";
import { CheckCheck, ShieldCheck, Database, FileMinus, PlayCircle, HelpCircle, Activity, LayoutGrid, Award } from "lucide-react";
import { RealJob, PortalCredential, ManualReviewQueueItem } from "../types";

interface Props {
  candidateId: string;
  candidateName: string;
  credentials: PortalCredential[];
  jobs: RealJob[];
  reviews: ManualReviewQueueItem[];
  vRole: "admin" | "candidate";
  onToggleRole: (role: "admin" | "candidate") => void;
}

export default function DashboardStats({
  candidateId,
  candidateName,
  credentials,
  jobs,
  reviews,
  vRole,
  onToggleRole
}: Props) {
  const currentCredentials = credentials.filter(c => c.candidateId === candidateId);
  const currentJobs = jobs.filter(j => j.candidateId === candidateId);
  const currentReviews = reviews.filter(r => r.candidateId === candidateId);

  // Math equations
  const enabledPortalsCount = currentCredentials.filter(c => c.enabled).length;
  const verifiedPortalsCount = currentCredentials.filter(c => c.enabled && c.verificationStatus === "verified").length;
  const failedLoginsCount = currentCredentials.filter(c => c.enabled && c.verificationStatus === "login_failed").length;
  
  const scrapedCount = currentJobs.length;
  const appliedCount = currentJobs.filter(j => j.applyStatus === "applied").length;
  const manualReviewPending = currentJobs.filter(j => j.applyStatus === "manual_review").length;
  
  const unknownQuestionsCount = currentReviews.filter(r => r.reason === "unknown_question" || r.reason === "low_confidence_answer").length;
  
  const successRate = appliedCount + scrapedCount > 0 
    ? Math.round((appliedCount / (appliedCount + manualReviewPending + currentJobs.filter(j => j.applyStatus === "failed").length || 1)) * 100) 
    : 100;

  return (
    <div id="dashboard-stats-root" className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
      
      {/* Selector banner */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 border-b border-slate-150 pb-3">
        <div className="flex items-center gap-1.5">
          <Activity className="text-slate-950 w-5 h-5" />
          <div>
            <h1 className="text-sm font-bold text-slate-950 tracking-tight font-sans">
              Dynamic Real-Time Operation Monitor
            </h1>
            <p className="text-[10px] text-slate-500 font-sans">Toggle recruiter or individual candidate modules views</p>
          </div>
        </div>

        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          <button
            id="tab-view-admin"
            type="button"
            onClick={() => onToggleRole("admin")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-sans font-semibold transition-all ${
              vRole === "admin"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            Admin / Recruiter Dashboard
          </button>
          <button
            id="tab-view-candidate"
            type="button"
            onClick={() => onToggleRole("candidate")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-sans font-semibold transition-all ${
              vRole === "candidate"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            Candidate Portal view
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: Admin Perspective Dashboard */}
      {vRole === "admin" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Monitoring Scope: Recruiters Overseer Dashboard ({candidateName})
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Verified Channels</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-slate-950 tracking-tight">{verifiedPortalsCount} <span className="text-xs font-normal text-slate-400">/ {enabledPortalsCount}</span></span>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[9.5px] text-slate-500 pt-1 font-sans">Enabled & certified verified connections</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Factual Scraped Matches</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-slate-950 tracking-tight">{scrapedCount}</span>
                <Database className="w-5 h-5 text-slate-800 shrink-0" />
              </div>
              <p className="text-[9.5px] text-slate-500 pt-1 font-sans">Acquired real vacant leads</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Manual Reviews Pending</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-slate-950 tracking-tight">{manualReviewPending + unknownQuestionsCount}</span>
                <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
              </div>
              <p className="text-[9.5px] text-slate-500 pt-1 font-sans">Custom entries or captcha blocks active</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Success Fill Rate</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-emerald-700 tracking-tight">{successRate}%</span>
                <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[9.5px] text-slate-500 pt-1 font-sans">Successful transactions to manual holds</p>
            </div>

          </div>
        </div>
      ) : (
        /* RENDER VIEW 2: Candidate Perspective Dashboard */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Personal Tracking Workspace: {candidateName}'s Dashboard View
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs text-slate-700">
            
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Active Channels</span>
              <span className="text-lg font-bold text-slate-950 block pt-1">{enabledPortalsCount} Portals</span>
              <p className="text-[9.5px] text-slate-400 font-sans mt-1">Ready for automatic match scanning</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Auto Applied Jobs</span>
              <span className="text-lg font-bold text-emerald-700 block pt-1">{appliedCount} Applied</span>
              <p className="text-[9.5px] text-slate-400 font-sans mt-1">Submitted on your behalf</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Exceptional Hold</span>
              <span className="text-lg font-bold text-amber-600 block pt-1">{manualReviewPending + unknownQuestionsCount} Blocks</span>
              <p className="text-[9.5px] text-slate-400 font-sans mt-1">Awaiting admin resolver answers</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block font-sans">Match Score Average</span>
              <span className="text-lg font-bold text-indigo-700 block pt-1">
                {currentJobs.length > 0 ? Math.round(currentJobs.reduce((acc, j) => acc + j.matchScore, 0) / currentJobs.length) : 0}% Acc.
              </span>
              <p className="text-[9.5px] text-slate-400 font-sans mt-1">Grounded matching threshold</p>
            </div>

          </div>
        </div>
      )}

      {/* Shared Section: Real-Time Portal Connections & Sync Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 font-sans tracking-tight">
              Real-Time Portal Connections & Sync Monitor Metrics ({candidateName})
            </h4>
            <p className="text-[10px] text-slate-500 font-sans">
              Metrics for all portals: only enabled and verified credentials are used to fetch live vacancies and execute autofill submissions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Scheduler Status: Active (Polling live every 6s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-sans">
            <thead>
              <tr className="border-b border-sidebar-border text-slate-400 font-semibold align-middle">
                <th className="pb-2 font-medium">Channel / Portal</th>
                <th className="pb-2 font-medium">Status & Verification</th>
                <th className="pb-2 font-medium">Login User</th>
                <th className="pb-2 font-medium text-center">Sync Flow State</th>
                <th className="pb-2 font-medium text-right">Last Sync Scan</th>
                <th className="pb-2 font-medium text-right pr-2">Scraped Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: "linkedin", name: "LinkedIn" },
                { id: "indeed", name: "Indeed" },
                { id: "glassdoor", name: "Glassdoor" },
                { id: "ziprecruiter", name: "ZipRecruiter" },
                { id: "naukri", name: "Naukri" },
                { id: "monster", name: "Monster" },
                { id: "dice", name: "Dice" },
                { id: "googlejobs", name: "Google Jobs" },
                { id: "company", name: "Company Pages" }
              ].map((portal) => {
                const cred = currentCredentials.find(c => c.portalId === portal.id);
                const portalJobs = currentJobs.filter(j => j.portalId === portal.id);
                
                const isEnabled = cred?.enabled || false;
                const vStatus = cred?.verificationStatus || "not_connected";
                const userLogin = cred?.username || "—No credentials—";
                const lastScraped = cred?.lastScrapedAt;

                let syncStateLabel = "Offline (Disabled)";
                let syncStateColor = "text-slate-400 bg-slate-50 border-slate-150";
                
                if (isEnabled) {
                  if (vStatus === "verified") {
                    syncStateLabel = "Live Scraper (Idle)";
                    syncStateColor = "text-emerald-700 bg-emerald-50/50 border-emerald-150";
                  } else if (vStatus === "pending_verification") {
                    syncStateLabel = "Authenticating...";
                    syncStateColor = "text-amber-700 bg-amber-50/50 border-amber-150 animate-pulse";
                  } else if (vStatus === "otp_required") {
                    syncStateLabel = "Auth Paused (MFA)";
                    syncStateColor = "text-amber-700 bg-amber-50 border-amber-250 font-semibold animate-pulse";
                  } else if (vStatus === "captcha_required") {
                    syncStateLabel = "Auth Paused (CAPTCHA)";
                    syncStateColor = "text-purple-700 bg-purple-50 border-purple-250 font-semibold animate-pulse";
                  } else {
                    syncStateLabel = "Sync Failed (Error)";
                    syncStateColor = "text-rose-700 bg-rose-50 border-rose-150";
                  }
                } else if (cred) {
                  syncStateLabel = "Disabled";
                  syncStateColor = "text-slate-400 bg-slate-50 border-slate-200/60";
                } else {
                  syncStateLabel = "Not Connected";
                  syncStateColor = "text-slate-300 bg-slate-50/30 border-slate-100";
                }

                return (
                  <tr key={portal.id} className="text-slate-700 hover:bg-slate-50/20 align-middle">
                    <td className="py-2 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          isEnabled && vStatus === "verified" ? "bg-emerald-500 animate-pulse" :
                          isEnabled && (vStatus === "otp_required" || vStatus === "captcha_required" || vStatus === "pending_verification") ? "bg-amber-500 animate-pulse" :
                          isEnabled ? "bg-rose-500" : "bg-slate-300"
                        }`} />
                        {portal.name}
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border font-sans ${
                        vStatus === "verified" ? "bg-emerald-50/30 text-emerald-700 border-emerald-100 font-semibold" :
                        vStatus === "otp_required" || vStatus === "captcha_required" ? "bg-amber-50 text-amber-700 border-amber-100 font-semibold" :
                        vStatus === "login_failed" ? "bg-rose-50 text-rose-700 border-rose-100 font-semibold" : 
                        "bg-slate-50 text-slate-500 border-slate-150"
                      }`}>
                        {vStatus.toUpperCase().replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 truncate max-w-[130px] font-mono text-slate-600" title={userLogin}>{userLogin}</td>
                    <td className="py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] border font-mono ${syncStateColor}`}>
                        {syncStateLabel}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-500 text-[10px]">
                      {lastScraped ? new Date(lastScraped).toLocaleTimeString() : "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-800 font-bold pr-2">
                      {portalJobs.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
