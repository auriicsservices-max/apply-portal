import React, { useState } from "react";
import { Terminal, Bell, AlertTriangle, CheckCircle2, Info, Eye, X, Mail } from "lucide-react";
import { ApplicationLog, AppNotification } from "../types";

interface Props {
  candidateId: string;
  logs: ApplicationLog[];
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => Promise<void>;
}

export default function LogsAndNotifications({
  candidateId,
  logs,
  notifications,
  onMarkNotificationRead
}: Props) {
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(null);

  const candidateLogs = logs
    .filter((l) => l.candidateId === candidateId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const candidateNotifications = notifications
    .filter((n) => n.candidateId === candidateId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getLogStatusClass = (status: ApplicationLog["status"]) => {
    switch (status) {
      case "success":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "error":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "warning":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case "error":
        return <X className="w-4 h-4 text-rose-600 border border-rose-350 bg-rose-50 rounded-full shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div id="logs-notifications-root" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Visual Telemetry Terminal Logs (Span 2) */}
      <div className="lg:col-span-2 bg-slate-950 text-slate-100 rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-widest font-mono">
              REAL-TIME AUTOMATION LOGS & SHADOW LOGS
            </h2>
          </div>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800/60 rounded">
            BUFFER ACTIVE
          </span>
        </div>

        {/* Console Box */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {candidateLogs.map((log) => (
            <div
              id={`log-line-${log.id}`}
              key={log.id}
              className="text-xs p-3 rounded-lg border border-slate-900 bg-slate-950 font-mono space-y-1.5 animate-fadeIn"
            >
              <div className="flex justify-between items-start gap-3 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-300">
                  {log.portalName} • {log.companyName ? log.companyName : "Handshake"}
                </span>
                <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed break-words pl-1.5 border-l border-emerald-500/40">
                {log.actionPerformed}
              </p>

              {/* Screenshot attached trigger */}
              {log.screenshotUrl && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Attached Proof Screenshot:</span>
                  <button
                    id={`btn-view-proof-${log.id}`}
                    type="button"
                    onClick={() => setExpandedScreenshot(log.screenshotUrl || null)}
                    className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded border border-slate-800 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View Prefill Screenshot
                  </button>
                </div>
              )}
            </div>
          ))}

          {candidateLogs.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              // Waiting for active verification, scraping or apply tasks to build trace arrays.
            </div>
          )}
        </div>
      </div>

      {/* Notifications Side Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-5 h-5 text-slate-900" />
          <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
            Notification Feed
          </h2>
          {candidateNotifications.filter(n => !n.read).length > 0 && (
            <span className="bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-sans font-bold">
              {candidateNotifications.filter(n => !n.read).length}
            </span>
          )}
        </div>

        {/* Notifications list */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
          {candidateNotifications.map((notif) => (
            <div
              id={`notification-box-${notif.id}`}
              key={notif.id}
              onClick={async () => {
                if (!notif.read) {
                  await onMarkNotificationRead(notif.id);
                }
              }}
              className={`p-3 rounded-xl border flex items-start gap-2 text-xs cursor-pointer transition-all ${
                notif.read 
                  ? "bg-white border-slate-100/80 hover:bg-slate-50/50" 
                  : "bg-slate-50 border-slate-200 text-slate-950 font-medium"
              }`}
            >
              {getNotificationIcon(notif.type)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 truncate">{notif.title}</span>
                  <span className="text-[9px] text-slate-400 font-sans shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-sans">{notif.message}</p>
              </div>
            </div>
          ))}

          {candidateNotifications.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs font-sans">
              No recent notifications dispatched.
            </div>
          )}
        </div>
      </div>

      {/* Expanded proof screenshot view layout modal portal */}
      {expandedScreenshot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full p-4 relative shadow-2xl animate-scaleUp">
            
            <button
              id="btn-close-screenshot-modal"
              type="button"
              onClick={() => setExpandedScreenshot(null)}
              className="absolute right-3 top-3 p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xs font-bold text-slate-950 pr-8 font-sans mb-3">
              Security Shadow Automation: Dynamic Form Prefill Captured Screen
            </h3>

            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
              <img
                src={expandedScreenshot}
                alt="Confirmation Proof screenshot grid"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 text-[10px] text-emerald-400 font-mono px-3 py-1.5 rounded-md border border-slate-800">
                Handshake status: FORM_SUBMIT_SUCCESS // SSL CERTIFIED
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
