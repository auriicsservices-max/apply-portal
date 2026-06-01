import React, { useState } from "react";
import { Copy, Plus, Trash2, Key, HelpCircle, Save, Sparkles } from "lucide-react";
import { AnswerBankEntry } from "../types";

interface Props {
  candidateId: string;
  entries: AnswerBankEntry[];
  onAddOrUpdateEntry: (entry: Omit<AnswerBankEntry, "candidateId" | "id"> & { id?: string }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export default function AnswerBank({
  candidateId,
  entries,
  onAddOrUpdateEntry,
  onDeleteEntry
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [questionKey, setQuestionKey] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionKey || !questionText || !answerText) return;

    await onAddOrUpdateEntry({
      questionKey: questionKey.toLowerCase().trim().replace(/\s+/g, "_"),
      questionText: questionText.trim(),
      answerText: answerText.trim()
    });

    setQuestionKey("");
    setQuestionText("");
    setAnswerText("");
    setIsAdding(false);
  };

  const handleStartEdit = (entry: AnswerBankEntry) => {
    setEditingId(entry.id);
    setQuestionKey(entry.questionKey);
    setQuestionText(entry.questionText);
    setAnswerText(entry.answerText);
  };

  const handleUpdate = async (id: string) => {
    await onAddOrUpdateEntry({
      id,
      questionKey: questionKey.toLowerCase().trim().replace(/\s+/g, "_"),
      questionText: questionText.trim(),
      answerText: answerText.trim()
    });
    setEditingId(null);
    setQuestionKey("");
    setQuestionText("");
    setAnswerText("");
  };

  const candidateEntries = entries.filter((e) => e.candidateId === candidateId);

  return (
    <div id="answer-bank-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Candidate Answer Bank & FAQ Solver
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Store specific parameters for common custom questions (e.g., relocation, notice, salary limits).
          </p>
        </div>
        <button
          id="btn-add-bank-entry"
          type="button"
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer flex items-center gap-1 bg-white"
        >
          <Plus className="w-3.5 h-3.5" /> New Variable
        </button>
      </div>

      {/* Adding Form Panel */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Sparkles className="w-4 h-4 text-slate-700" />
            <span>Create Custom Solver Definition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Variable Identifier Tag</label>
              <input
                id="bank-new-key"
                type="text"
                value={questionKey}
                onChange={(e) => setQuestionKey(e.target.value)}
                placeholder="e.g. sponsorship"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 uppercase font-mono text-[10.5px]"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 font-medium mb-1">Target Question Pattern (or partial lookup text)</label>
              <input
                id="bank-new-question"
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Do you require visa sponsorship?"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Standard Decisive Autofill Answer</label>
            <input
              id="bank-new-answer"
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="e.g. No, I do not require corporate sponsorship."
              className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 font-sans"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              id="btn-cancel-add-bank"
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              id="btn-save-add-bank"
              type="submit"
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
            >
              Add Definition
            </button>
          </div>
        </form>
      )}

      {/* Entries Display list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {candidateEntries.map((e) => {
          const isEditing = editingId === e.id;
          
          return (
            <div
              id={`bank-card-${e.id}`}
              key={e.id}
              className="border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 relative bg-slate-50/20"
            >
              {isEditing ? (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Identifier Tag</span>
                      <input
                        type="text"
                        value={questionKey}
                        onChange={(e) => setQuestionKey(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-1.5 py-1 rounded font-mono text-[10px] uppercase text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Pattern</span>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-1.5 py-1 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Override Answer</span>
                    <input
                      type="text"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-1.5 py-1 text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-[10px] border border-slate-200 bg-white text-slate-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(e.id)}
                      className="px-2.5 py-1 text-[10px] bg-slate-950 text-white font-medium rounded-md"
                    >
                      Save Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pr-8">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-700 font-bold uppercase tracking-wider">
                      {e.questionKey}
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  
                  <span className="block font-semibold text-slate-800 text-[11px] font-sans truncate">
                    {e.questionText}
                  </span>
                  
                  <p className="text-[11.5px] text-slate-600 pl-1 border-l-2 border-slate-300 font-sans italic truncate">
                    "{e.answerText}"
                  </p>

                  {/* Absolute positioning helper triggers */}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-slate-400 hover:text-slate-950 transition-colors">
                    <button
                      id={`btn-edit-bank-${e.id}`}
                      type="button"
                      onClick={() => handleStartEdit(e)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900"
                      title="Edit Entry"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-del-bank-${e.id}`}
                      type="button"
                      onClick={async () => {
                        await onDeleteEntry(e.id);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-rose-500 hover:text-rose-700"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {candidateEntries.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs md:col-span-2">
            No bank entry structures mapped. Click "New Variable" above to seed.
          </div>
        )}
      </div>
    </div>
  );
}
