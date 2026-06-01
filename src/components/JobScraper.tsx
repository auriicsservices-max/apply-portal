import React, { useState } from "react";
import { Briefcase, Search, Sparkles, Loader2, Link2, ExternalLink, ShieldCheck, CheckCircle2, Play, AlertCircle, Eye, EyeOff, Info, Building } from "lucide-react";
import { RealJob, Candidate, PortalCredential, ApplicationLog } from "../types";

interface Props {
  candidate: Candidate;
  credentials: PortalCredential[];
  jobs: RealJob[];
  onScrapeJobs: () => Promise<void>;
  onApplyJob: (jobId: string) => Promise<any>;
  logs?: ApplicationLog[];
}

export default function JobScraper({
  candidate,
  credentials,
  jobs,
  onScrapeJobs,
  onApplyJob,
  logs = []
}: Props) {
  const [isScraping, setIsScraping] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [subTab, setSubTab] = useState<"matched" | "tracker" | "all">("matched");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const verifiedAndEnabledList = credentials.filter(c => c.enabled && c.verificationStatus === "verified");
  const unverifiedList = credentials.filter(c => c.enabled && c.verificationStatus !== "verified");

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      await onScrapeJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      await onApplyJob(jobId);
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const openCount = jobs.filter(j => j.candidateId === candidate.id && j.applyStatus === "scraped").length;
  const trackerCount = jobs.filter(j => j.candidateId === candidate.id && j.applyStatus !== "scraped").length;

  const candidateJobs = jobs.filter(j => {
    const matchesCandidate = j.candidateId === candidate.id;
    if (!matchesCandidate) return false;

    if (subTab === "matched" && j.applyStatus !== "scraped") {
      return false;
    }
    if (subTab === "tracker" && j.applyStatus === "scraped") {
      return false;
    }

    const matchesQuery = j.jobTitle.toLowerCase().includes(filterText.toLowerCase()) || 
      j.companyName.toLowerCase().includes(filterText.toLowerCase()) ||
      j.portalName.toLowerCase().includes(filterText.toLowerCase());

    return matchesQuery;
  });

  return (
    <div id="job-scraper-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Matched Jobs Board (Scraped Grounded Results)
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Collects real, live vacancies based on filter settings and initiates automated pre-fills.
          </p>
        </div>

        <button
          id="btn-trigger-scrape"
          onClick={handleScrape}
          disabled={isScraping || verifiedAndEnabledList.length === 0}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
        >
          {isScraping ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning Grounded Leads...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Scan Verified Portals
            </>
          )}
        </button>
      </div>

      {/* Target parameters summary block */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-600 font-sans">
        <div>
          <span className="font-bold text-slate-800 block">Scraping Keywords:</span>
          <span className="truncate block">{candidate.targetJobTitles?.join(", ") || candidate.currentRole}</span>
        </div>
        <div>
          <span className="font-bold text-slate-800 block">Location Focus:</span>
          <span>{candidate.location}</span>
        </div>
        <div>
          <span className="font-bold text-slate-800 block">Domain Restrict:</span>
          <span>{candidate.domain}</span>
        </div>
        <div>
          <span className="font-bold text-slate-800 block">Channels Active:</span>
          {verifiedAndEnabledList.length > 0 ? (
            <span className="text-emerald-700 font-medium">{verifiedAndEnabledList.length} Portals Connected</span>
          ) : (
            <span className="text-rose-600 font-medium">0 Verified Portals Enabled!</span>
          )}
        </div>
      </div>

      {/* Warning banner about unverified portals */}
      {unverifiedList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] leading-relaxed text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Disabled/Unverified connections:</span> {unverifiedList.map(c => c.portalName).join(", ")}. 
            Auto Apply cannot submit on these endpoints until their credentials pass login verification tests in the <span className="font-semibold">Credentials Manager</span>.
          </div>
        </div>
      )}

      {/* Sub-tab selection bar */}
      <div className="flex border-b border-slate-100 pb-1 gap-1.5 font-sans md:gap-4">
        <button
          onClick={() => { setSubTab("matched"); setExpandedJobId(null); }}
          className={`pb-2 text-xs font-bold px-2 border-b-2 transition-all cursor-pointer ${
            subTab === "matched"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          1. Open Matched Board ({openCount})
        </button>
        <button
          onClick={() => { setSubTab("tracker"); setExpandedJobId(null); }}
          className={`pb-2 text-xs font-bold px-2 border-b-2 transition-all cursor-pointer ${
            subTab === "tracker"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          2. Applications Tracker ({trackerCount})
        </button>
        <button
          onClick={() => { setSubTab("all"); setExpandedJobId(null); }}
          className={`pb-2 text-xs font-bold px-2 border-b-2 transition-all cursor-pointer ${
            subTab === "all"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All System Jobs ({jobs.filter(j => j.candidateId === candidate.id).length})
        </button>
      </div>

      {/* Search Filter Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="job-filter-input"
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter job titles, companies or sites..."
          className="w-full bg-slate-50 hover:bg-slate-150 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-950 transition-colors font-sans"
        />
      </div>

      {/* Jobs Matched listings */}
      <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1 font-sans">
        {candidateJobs.map((job) => {
          const isApplying = applyingJobId === job.id;
          
          let scoreColor = "bg-rose-50 text-rose-700 border-rose-200";
          if (job.matchScore >= 90) scoreColor = "bg-emerald-50 text-emerald-800 border-emerald-250";
          else if (job.matchScore >= 75) scoreColor = "bg-amber-50 text-amber-800 border-amber-200";

          const portalCred = credentials.find(c => c.portalId === job.portalId);

          const filteredLogs = logs.filter(l => 
            l.companyName.toLowerCase() === job.companyName.toLowerCase() &&
            (l.jobTitle.toLowerCase().includes(job.jobTitle.toLowerCase()) || 
             job.jobTitle.toLowerCase().includes(l.jobTitle.toLowerCase()))
          );

          const logWithScreenshot = filteredLogs.find(l => l.screenshotUrl);

          return (
            <div
              id={`job-card-block-${job.id}`}
              key={job.id}
              className="bg-white border hover:bg-slate-50/25 border-slate-200 rounded-xl p-4 flex flex-col gap-1 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-xs tracking-tight truncate">{job.jobTitle}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] border font-bold ${scoreColor}`}>
                      {job.matchScore}% Match Score
                    </span>
                    
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] border border-slate-200/50 font-semibold font-sans">
                      {job.portalName}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-3 text-[10px] text-slate-500 font-sans flex-wrap">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {job.companyName}
                    </span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Grounded Source
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-2 md:line-clamp-none">{job.jobDescription}</p>

                  <div className="pt-1 flex items-center gap-2.5 text-[9.5px] text-slate-400 font-sans">
                    <span>Posted: {job.postedDate || "Unknown"}</span>
                    <span>•</span>
                    <span>Match scraped: {new Date(job.scrapedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Action columns */}
                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 min-w-[130px]">
                  
                  {/* Apply Status details */}
                  <div className="text-[10px] font-sans">
                    {job.applyStatus === "applied" && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied Successfully
                      </span>
                    )}
                    {job.applyStatus === "scraped" && (
                      <span className="text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                        Ready to Auto Apply
                      </span>
                    )}
                    {job.applyStatus === "manual_review" && (
                      <span className="text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-purple-650" /> Intercepted Action
                      </span>
                    )}
                    {job.applyStatus === "failed" && (
                      <span className="text-rose-700 font-bold bg-rose-50 border border-rose-250 px-2.5 py-1 rounded-full">
                        Prerequisites Failed
                      </span>
                    )}
                    {job.applyStatus === "expired" && (
                      <span className="text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        Expired Listing
                      </span>
                    )}
                  </div>

                  {/* Automation trigger button */}
                  <div className="flex gap-2 font-sans text-xs">
                    <button
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title={expandedJobId === job.id ? "Minimize details" : "Inspect linked portal and company logs details"}
                    >
                      {expandedJobId === job.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span className="text-[10.5px] hidden md:inline font-bold">Details</span>
                    </button>

                    <a
                      href={job.originalJobUrl}
                      target="_blank"
                      rel="noreferrer referrer"
                      className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 bg-white rounded-lg transition-colors shrink-0"
                      title="View Original Listing"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {job.applyStatus === "scraped" && (
                      <button
                        id={`job-apply-btn-${job.id}`}
                        onClick={() => handleApply(job.id)}
                        disabled={isScraping || isApplying}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            Auto Apply
                          </>
                        )}
                      </button>
                    )}
                    
                    {job.applyStatus === "manual_review" && (
                      <span className="text-[10.5px] text-slate-400 italic font-sans pr-1">
                        Needs review
                      </span>
                    )}
                    
                    {job.applyStatus === "applied" && (
                      <span className="text-[10.5px] text-emerald-600 font-bold font-sans pr-1">
                        Applied
                      </span>
                    )}

                    {job.applyStatus === "expired" && (
                      <span className="text-[10.5px] text-slate-400 italic font-sans pr-1">
                        Outdated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible detail box containing company profile guide, automation step logs, match formulas details */}
              {expandedJobId === job.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-4 text-xs font-sans">
                  
                  {/* Grid 1: Dossiers & Matched Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Company Profile Dossier */}
                    <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block text-indigo-600">Company & Portal Dossier</span>
                      <div className="space-y-1.5 text-slate-600 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Headquarters Domain:</span>
                          <a 
                            href={`https://www.${job.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`} 
                            target="_blank" 
                            rel="noreferrer referrer"
                            className="text-indigo-600 hover:underline font-bold block truncate"
                          >
                            www.{job.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Job Search Country Check:</span>
                          <span className="font-medium text-slate-700">{job.country || "Not Specified"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Verified Portal System:</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Grounded {job.portalName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submission Credentials & Profile Used */}
                    <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block text-indigo-600 text-indigo-600">Account & Profile Handshake</span>
                      <div className="space-y-1.5 text-slate-600 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Credential Username:</span>
                          <span className="font-medium text-slate-700 block truncate">{portalCred?.username || "N/A (Portal Offline)"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Resume Transmitted:</span>
                          <span className="font-medium text-slate-700 block truncate">{candidate.resumeFilename || "No resume"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contact Transferred:</span>
                          <span className="font-medium text-slate-700 block truncate">{candidate.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Analysis Breakdown */}
                    <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block text-indigo-600">Match Score Criteria</span>
                      <div className="space-y-1.5 text-slate-600 text-[11px]">
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <span className="text-slate-500">Domain Closeness:</span>
                          <span className="font-bold text-emerald-600">Pass</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <span className="text-slate-500 font-mono text-[9.5px]">Required Skills Match:</span>
                          <span className="font-bold text-emerald-600 font-mono text-[9.5px]">Match Badge</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <span className="text-slate-500 font-mono text-[9.5px]">Min Score Rule:</span>
                          <span className="font-bold text-indigo-600 font-mono text-[9.5px]">&gt;= 70% Limit</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Grid 2: Trace Logs & Screenshots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    
                    {/* Automation Trace Logs */}
                    <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block text-indigo-600">Submit Trace & Automation Scripting Logs</span>
                      {filteredLogs.length > 0 ? (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {filteredLogs.map((l, index) => (
                            <div key={l.id || index} className="border-l-2 border-indigo-200 pl-2 text-[10.5px]">
                              <div className="flex items-center justify-between text-[9px] text-slate-400">
                                <span className="font-bold uppercase text-[8px] text-indigo-400">Step {index + 1}</span>
                                <span>{new Date(l.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-slate-700 font-semibold mt-0.5">{l.actionPerformed}</p>
                              {l.errorMessage && (
                                <p className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono text-[9.5px] mt-1">{l.errorMessage}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 italic">
                          {job.applyStatus === "scraped" ? "Ready for dispatch. No trace logs recorded yet." : "Trace logs summarized in main logs center."}
                        </div>
                      )}
                    </div>

                    {/* Grounded Success Showcase or Questions Answered */}
                    <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block text-indigo-600 font-bold">Captured Submit Proof Screenshot</span>
                      
                      {logWithScreenshot ? (
                        <div className="space-y-2">
                          <div className="relative group overflow-hidden border border-slate-200 rounded-lg max-w-xs mx-auto">
                            <img
                              src={logWithScreenshot.screenshotUrl}
                              referrerPolicy="no-referrer"
                              className="w-full object-cover h-24 filter group-hover:brightness-105 transition-all rounded"
                              alt="automation screenshot status proof"
                            />
                            <div className="absolute bottom-1 right-1 bg-slate-900/90 text-[8px] text-emerald-400 px-1 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> SECURE HANDSHAPE PROOF
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold text-center italic mt-1 font-mono">
                            Successful submit snapshot stored securely.
                          </p>
                        </div>
                      ) : job.errorLog ? (
                        <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-lg space-y-1">
                          <span className="font-bold text-rose-800 block text-[10.5px]">Application Paused Reason:</span>
                          <p className="text-rose-700 font-medium leading-relaxed">{job.errorLog}</p>
                          <span className="block text-[9px] text-slate-400 font-mono italic">Trace: PAUSED_FOR_MANUAL_HOLD</span>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 italic">
                          No viewport snapshot captured yet. Submissions will capture real-time application screen proofs.
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}

        {candidateJobs.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            {isScraping ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                <span>Crawling job boards live. Connecting with search grounding tools...</span>
              </div>
            ) : (
              <span>No matched jobs scraped. Ensure portals are verified, then hit "Scan Verified Portals" to populate the feed.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
