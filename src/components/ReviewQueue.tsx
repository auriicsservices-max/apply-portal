import React, { useState } from "react";
import { AlertCircle, HelpCircle, ArrowRight, Loader2, Save, Send, ShieldAlert, Sparkles } from "lucide-react";
import { ManualReviewQueueItem } from "../types";

interface Props {
  reviews: ManualReviewQueueItem[];
  onResolveReview: (id: string, answerText: string, saveToBank: boolean, questionKey?: string) => Promise<void>;
}

export default function ReviewQueue({ reviews, onResolveReview }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveToBanks, setSaveToBanks] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleSubmit = async (reviewId: string, qKey?: string) => {
    setResolvingId(reviewId);
    const text = answers[reviewId];
    const save = saveToBanks[reviewId] !== false; // default to true
    
    try {
      await onResolveReview(reviewId, text, save, qKey || keys[reviewId]);
      // clear local buffers
      const updatedAnswers = { ...answers };
      delete updatedAnswers[reviewId];
      setAnswers(updatedAnswers);
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div id="review-queue-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-700 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
            Manual Review & Exception Queue
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Reviews logs blocked by CAPTCHAs, MFA, or complex custom questions. Correct answers and retry applying.
        </p>
      </div>

      {/* Main Review items list */}
      <div className="space-y-3">
        {reviews.map((item) => {
          const isResolving = resolvingId === item.id;
          const isQuestion = item.reason === "unknown_question" || item.reason === "low_confidence_answer";

          return (
            <div
              id={`review-item-block-${item.id}`}
              key={item.id}
              className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-4 space-y-3 animate-fadeIn"
            >
              <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/30">
                    {item.reason.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Blocked at: {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-[10.5px] text-slate-500 font-sans">
                  Candidate: <span className="font-semibold text-slate-900">{item.candidateName}</span>
                </div>
              </div>

              {/* Blocking description context */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 space-y-1.5 font-sans">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Blocked on {item.portalName} • {item.companyName}</span>
                  {item.scrapedJob && (
                    <span className="text-[9.5px] text-slate-400 font-normal">
                      Role match: {item.scrapedJob.jobTitle}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11.5px]">{item.description}</p>
              </div>

              {/* Interactive Solving Form */}
              {isQuestion && item.questionToAnswer && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Provide Manual Answer Override</span>
                  </div>

                  <p className="text-[11.5px] text-slate-800 font-medium pl-5 italic">
                    "{item.questionToAnswer.questionText}"
                  </p>

                  <div className="space-y-3 pt-1.5 border-t border-slate-100">
                    
                    {/* Render inputs based on type */}
                    {item.questionToAnswer.questionType === "yes_no" || item.questionToAnswer.options && item.questionToAnswer.options.length > 0 ? (
                      <div className="flex gap-2 flex-wrap pl-1">
                        {(item.questionToAnswer.options || ["Yes", "No"]).map((opt) => (
                          <button
                            id={`opt-btn-${opt}`}
                            key={opt}
                            type="button"
                            onClick={() => setAnswers({ ...answers, [item.id]: opt })}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-sans font-medium transition-all ${
                              answers[item.id] === opt
                                ? "bg-slate-950 border-slate-950 text-white"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={`input-override-${item.id}`}
                        type="text"
                        placeholder="Type answer here..."
                        value={answers[item.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [item.id]: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-slate-950 font-sans"
                        required
                      />
                    )}

                    {/* Meta options: Answer bank saving */}
                    <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans cursor-pointer select-none">
                        <input
                          id={`cb-save-bank-${item.id}`}
                          type="checkbox"
                          checked={saveToBanks[item.id] !== false}
                          onChange={(e) => setSaveToBanks({ ...saveToBanks, [item.id]: e.target.checked })}
                          className="rounded border-slate-350 focus:ring-slate-950"
                        />
                        <span>Automatically save to candidate's Answer Bank for future auto-fills</span>
                      </label>

                      {saveToBanks[item.id] !== false && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-sans">Identifier Tag:</span>
                          <input
                            id={`tag-input-${item.id}`}
                            type="text"
                            placeholder="e.g. react_years"
                            value={keys[item.id] || ""}
                            onChange={(e) => setKeys({ ...keys, [item.id]: e.target.value })}
                            className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] max-w-[110px] uppercase font-mono text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Actions */}
                    <div className="flex justify-end pt-1">
                      <button
                        id={`btn-manual-resolve-${item.id}`}
                        onClick={() => handleSubmit(item.id, item.questionToAnswer?.questionText?.toLowerCase()?.includes("sponsor") ? "sponsorship" : undefined)}
                        disabled={isResolving || !answers[item.id]}
                        className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Submitting & Retrying...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Submit and Resume Auto Apply
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* MFA / Captcha redirect solver helper triggers */}
              {!isQuestion && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex justify-between items-center flex-wrap gap-2">
                  <span className="text-slate-500 font-sans">
                    Action needed: authenticate credential handshakes in the <span className="font-semibold text-slate-800">Credentials Manager</span> tab context.
                  </span>
                  <div className="flex items-center gap-1 text-slate-800 font-semibold text-[11px] uppercase font-sans tracking-tight">
                    Resolver Active <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            Clean status. No manual review items or blocked automation logs active.
          </div>
        )}
      </div>
    </div>
  );
}
