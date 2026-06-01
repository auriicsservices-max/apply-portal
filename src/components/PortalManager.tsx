import React, { useState } from "react";
import { Shield, ToggleLeft, ToggleRight, CheckCircle2, XCircle, AlertTriangle, KeyRound, Clock, Eye, EyeOff, Sparkles, Send, HelpCircle } from "lucide-react";
import { PortalCredential } from "../types";

interface Props {
  candidateId: string;
  credentials: PortalCredential[];
  onUpdatePortal: (portalId: string, updatedFields: Partial<PortalCredential>) => Promise<void>;
  onVerifyPortal: (portalId: string) => Promise<void>;
  onSubmitOtp: (portalId: string, code: string) => Promise<void>;
  onSubmitCaptcha: (portalId: string, solution: string) => Promise<void>;
}

export default function PortalManager({
  candidateId,
  credentials,
  onUpdatePortal,
  onVerifyPortal,
  onSubmitOtp,
  onSubmitCaptcha
}: Props) {
  const [activePortalId, setActivePortalId] = useState<string | null>("linkedin");
  const [passcodes, setPasscodes] = useState<Record<string, string>>({});
  const [showsPassword, setShowsPassword] = useState<Record<string, boolean>>({});
  const [otpCodes, setOtpCodes] = useState<Record<string, string>>({});
  const [captchaSolutions, setCaptchaSolutions] = useState<Record<string, string>>({});

  const handleDirectOAuthConnect = () => {
    if (!activePortalId) return;
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open the server-side OAuth flow popup with specific candidate and portal details
    const popup = window.open(
      `/api/auth/oauth-popup?candidateId=${candidateId}&portalId=${activePortalId}`,
      "oauth_popup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      alert("Popup blocker active! Please allow popups to initiate the secure OAuth credentials connection.");
    }
  };

  const availablePortals = [
    { id: "linkedin", name: "LinkedIn", defaultUrl: "https://linkedin.com/login" },
    { id: "indeed", name: "Indeed", defaultUrl: "https://indeed.com/login" },
    { id: "glassdoor", name: "Glassdoor", defaultUrl: "https://glassdoor.com/profile/login" },
    { id: "ziprecruiter", name: "ZipRecruiter", defaultUrl: "https://ziprecruiter.com/login" },
    { id: "naukri", name: "Naukri", defaultUrl: "https://naukri.com/login" },
    { id: "monster", name: "Monster", defaultUrl: "https://monster.com/login" },
    { id: "dice", name: "Dice", defaultUrl: "https://dice.com/login" },
    { id: "googlejobs", name: "Google Jobs", defaultUrl: "https://google.com/jobs" },
    { id: "company", name: "Company career pages", defaultUrl: "https://careers.company.com/login" }
  ];

  const getPortalCred = (id: string): PortalCredential => {
    return credentials.find((c) => c.portalId === id) || {
      candidateId: credentials[0]?.candidateId || "",
      portalId: id,
      portalName: availablePortals.find(p => p.id === id)?.name || id,
      enabled: false,
      username: "",
      passwordEncrypted: "",
      loginUrl: availablePortals.find(p => p.id === id)?.defaultUrl || "",
      verificationStatus: "not_connected"
    };
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    await onUpdatePortal(id, { enabled: !currentEnabled });
  };

  const handleSaveCredential = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cred = getPortalCred(id);
    const formData = new FormData(e.currentTarget);
    const usernameVal = (formData.get("username") as string) || "";
    const loginUrlVal = (formData.get("loginUrl") as string) || cred.loginUrl;
    const notesVal = (formData.get("notes") as string) || "";
    const recoveryEmailVal = (formData.get("recoveryEmail") as string) || "";
    const pass = passcodes[id] !== undefined ? passcodes[id] : cred.passwordEncrypted;
    
    await onUpdatePortal(id, {
      username: usernameVal,
      passwordEncrypted: pass,
      loginUrl: loginUrlVal,
      notes: notesVal,
      recoveryEmail: recoveryEmailVal
    });
    
    // Clear temporary passcode buffer
    const updatedPasscodes = { ...passcodes };
    delete updatedPasscodes[id];
    setPasscodes(updatedPasscodes);
    alert(`Credentials updated for ${cred.portalName}. Click "Test Connection Flow" below to verify and activate auto-matching.`);
  };

  const statusBadge = (status: PortalCredential["verificationStatus"]) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active & Verified
          </span>
        );
      case "pending_verification":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Pending Verification
          </span>
        );
      case "otp_required":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> OTP Authentication Required
          </span>
        );
      case "captcha_required":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold animate-pulse">
            <Shield className="w-3.5 h-3.5 text-purple-600" /> CAPTCHA Intercepted
          </span>
        );
      case "login_failed":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Handshake Failed
          </span>
        );
      case "session_expired":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold">
            <Clock className="w-3.5 h-3.5" /> Session Expired
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-sans font-normal">
            Disabled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-sans font-normal">
            Disconnected
          </span>
        );
    }
  };

  return (
    <div id="portal-manager-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-900" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
            Job Portals & Secure Credentials
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Select portals below, fill login details, and complete automated verification checks.
        </p>
      </div>

      {/* Selector and Workspace split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Side: Portals List switcher with verification status badges */}
        <div className="md:col-span-1 space-y-1.5 max-h-[350px] overflow-y-auto pr-1 border-r border-slate-100">
          {availablePortals.map((p) => {
            const cred = getPortalCred(p.id);
            const active = activePortalId === p.id;
            
            return (
              <div
                id={`portal-btn-row-${p.id}`}
                key={p.id}
                className={`p-3 rounded-xl border text-xs flex flex-col gap-2 cursor-pointer transition-all ${
                  active 
                    ? "bg-slate-50 border-slate-300 shadow-sm" 
                    : "bg-white border-slate-100 hover:bg-slate-50/50"
                }`}
                onClick={() => setActivePortalId(p.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-950 font-sans">{p.name}</span>
                  
                  {/* Enable Switch toggle button */}
                  <button
                    id={`toggle-enable-${p.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(p.id, cred.enabled);
                    }}
                    className="text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    {cred.enabled ? (
                      <ToggleRight className="w-6 h-6 text-slate-800" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {cred.username ? `${cred.username.substring(0, 16)}...` : "Empty credentials"}
                  </span>
                  {statusBadge(cred.verificationStatus)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Active Portal Connection details work board */}
        <div className="md:col-span-2">
          {activePortalId ? (() => {
            const portalDef = availablePortals.find(p => p.id === activePortalId)!;
            const cred = getPortalCred(activePortalId);
            const maskText = cred.passwordEncrypted ? "*".repeat(Math.min(10, cred.passwordEncrypted.length)) : "";

            return (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Connection Title */}
                <div className="flex items-start md:items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{portalDef.name} Settings</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Configure authentication parameters</p>
                  </div>
                  <div>
                    {statusBadge(cred.verificationStatus)}
                  </div>
                </div>

                {/* ADVANCED INTEGRATION OPTION: OAuth Connection Manager Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-150 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-750 font-sans tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>INTEGRATED OAUTH SDK METHOD (RECOMMENDED)</span>
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {portalDef.name} Direct Account Verification Link
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                        Rather than storing manual credentials, launch the direct {portalDef.name} OAuth SDK handshake. Authentic, secure session tokens are saved directly to candidate database logs.
                      </p>
                    </div>
                    {activePortalId === "linkedin" && (
                      <span className="text-[9.5px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200">
                        react-native-linkedin-sdk v2
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      id={`btn-oauth-direct-${activePortalId}`}
                      type="button"
                      onClick={handleDirectOAuthConnect}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Authenticate Securely with {portalDef.name}</span>
                    </button>
                    
                    <span className="text-[10px] text-slate-400 font-sans italic">
                      Opens direct auth window callback channel.
                    </span>
                  </div>
                </div>

                {/* INTERACTIVE DEMO ASSIST: Verification Interactive Flow Solver */}
                {(cred.verificationStatus === "otp_required" || cred.verificationStatus === "captcha_required") && (
                  <div className="bg-slate-950 text-white rounded-xl p-4.5 space-y-3 shadow-md border border-slate-800 animate-pulse">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Security Automation Sandbox Handover</span>
                    </div>
                    
                    {cred.verificationStatus === "otp_required" ? (
                      <div className="space-y-2">
                        <p className="text-slate-300 text-[11.5px] leading-relaxed">
                          The system connected successfully using credentials but has triggered two-factor authentication (MFA/OTP). 
                          Please retrieve the dynamic code sent to your primary candidate channel and submit below to secure the session.
                        </p>
                        <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/30 px-2.5 py-1.5 rounded-lg font-sans">
                          💡 <strong>Secure Bypass Hint:</strong> To bypass OTP prompts entirely, we highly recommend trying the **Direct integrated OAuth SDK button** above. It links verified session tokens on the fly! Otherwise, input your dynamic 6-digit code below.
                        </p>
                        
                        <div className="flex items-center gap-2 max-w-sm pt-1">
                          <input
                            id={`input-otp-${activePortalId}`}
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 123456"
                            value={otpCodes[activePortalId] || ""}
                            onChange={(e) => setOtpCodes({ ...otpCodes, [activePortalId]: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-slate-400 flex-1 uppercase"
                          />
                          <button
                            id={`btn-submit-otp-${activePortalId}`}
                            type="button"
                            onClick={async () => {
                              const code = otpCodes[activePortalId] || "";
                              await onSubmitOtp(activePortalId, code);
                              setOtpCodes({ ...otpCodes, [activePortalId]: "" });
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Submit Code
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-slate-300 text-[11.5px] leading-relaxed flex flex-col gap-1">
                          <span>A security CAPTCHA is required to proceed. Resolve the image text to authorize chromium session handshakes:</span>
                          <span className="font-bold underline text-purple-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-purple-800/40 text-center font-mono select-none tracking-widest text-sm mt-1.5">
                            {cred.captchaChallenge || "Z8W4K"}
                          </span>
                        </p>
                        
                        <div className="flex items-center gap-2 max-w-sm pt-1">
                          <input
                            id={`input-captcha-${activePortalId}`}
                            type="text"
                            placeholder="Enter matching CAPTCHA text"
                            value={captchaSolutions[activePortalId] || ""}
                            onChange={(e) => setCaptchaSolutions({ ...captchaSolutions, [activePortalId]: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-slate-400 flex-1"
                          />
                          <button
                            id={`btn-submit-captcha-${activePortalId}`}
                            type="button"
                            onClick={async () => {
                              const sol = captchaSolutions[activePortalId] || "";
                              await onSubmitCaptcha(activePortalId, sol);
                              setCaptchaSolutions({ ...captchaSolutions, [activePortalId]: "" });
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Unlock Gate
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Hint: Case-insensitive solution is <span className="font-mono text-white">Z8W4K</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {cred.errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11.5px] text-rose-800 flex items-start gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <span className="font-semibold">Automation Error:</span> {cred.errorMessage}
                    </div>
                  </div>
                )}

                {/* Form Schema Details */}
                <form onSubmit={(e) => handleSaveCredential(activePortalId, e)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Username / Account Email</label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={cred.username}
                      placeholder="username@email.com"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-slate-950"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Account Password Or Token
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showsPassword[activePortalId] ? "text" : "password"}
                        name="password"
                        value={passcodes[activePortalId] !== undefined ? passcodes[activePortalId] : cred.passwordEncrypted}
                        onChange={(e) => setPasscodes({ ...passcodes, [activePortalId]: e.target.value })}
                        placeholder={cred.passwordEncrypted ? "••••••••••••••••" : "Type portal password"}
                        className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2 rounded-lg text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowsPassword({ ...showsPassword, [activePortalId]: !showsPassword[activePortalId] })}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showsPassword[activePortalId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {cred.passwordEncrypted && !passcodes[activePortalId] && (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Saved password is encrypted. Plaintext hidden for safety compliance.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Portal Login URL</label>
                    <input
                      type="url"
                      name="loginUrl"
                      defaultValue={cred.loginUrl || portalDef.defaultUrl}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-950 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Backup Recovery Email (Optional)</label>
                    <input
                      type="email"
                      name="recoveryEmail"
                      defaultValue={cred.recoveryEmail || ""}
                      placeholder="backup@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-950 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Configuration Comments / Automation Notes</label>
                    <input
                      type="text"
                      name="notes"
                      defaultValue={cred.notes || ""}
                      placeholder="e.g. Requires corporate VPN or proxy details sometimes."
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-950 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Operational Information Timestamps */}
                  <div className="md:col-span-2 grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10.5px] text-slate-500 font-sans">
                    <div className="space-y-0.5">
                      <span className="block font-semibold text-slate-700">Last Verified Status:</span>
                      <span>{cred.lastVerifiedAt ? new Date(cred.lastVerifiedAt).toLocaleString() : "Never"}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-semibold text-slate-700">Last Parsing Log:</span>
                      <span>{cred.lastScrapedAt ? new Date(cred.lastScrapedAt).toLocaleString() : "Never"}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-semibold text-slate-700">Last Auto-Apply submitted:</span>
                      <span>{cred.lastAppliedAt ? new Date(cred.lastAppliedAt).toLocaleString() : "Never"}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="md:col-span-2 flex justify-between gap-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <HelpCircle className="w-4 h-4" />
                      <span>Password guides: type "otp", "captcha" or "fail" to trigger interactive security flows!</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id={`btn-save-cred-${activePortalId}`}
                        type="submit"
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer bg-white"
                      >
                        Save Configuration
                      </button>
                      <button
                        id={`btn-verify-${activePortalId}`}
                        type="button"
                        onClick={async () => {
                          await onVerifyPortal(activePortalId);
                        }}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Test Connection Flow
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            );
          })() : (
            <div className="h-48 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
              Select any job portal from the left list to review configurations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
