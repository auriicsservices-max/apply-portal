import React, { useState } from "react";
import { Plus, User, Search, Briefcase, Mail } from "lucide-react";
import { Candidate } from "../types";

interface Props {
  candidates: Candidate[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onAddCandidate: (cand: Omit<Candidate, "id">) => void;
}

export default function CandidateSelector({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onAddCandidate,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Frontend Engineer");

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currentRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    onAddCandidate({
      name: newName,
      email: newEmail,
      phone: "+1 (555) 000-0000",
      location: "San Francisco, CA",
      preferredLocations: ["Remote"],
      experienceYears: 3,
      currentRole: newRole,
      targetJobTitles: [newRole],
      skills: ["React", "TypeScript"],
      domain: "Software Engineering",
      includeDomains: [],
      excludeDomains: [],
      preferredSectors: [],
      salaryExpectation: "$120,000",
      noticePeriod: "2 weeks",
      workAuthorization: "US Citizen",
      shiftPreference: "Flexible",
      resumeFilename: "",
      resumeText: "",
      linkedinUrl: "",
      portfolioUrl: "",
    });

    setNewName("");
    setNewEmail("");
    setNewRole("Frontend Engineer");
    setIsAdding(false);
  };

  return (
    <div id="candidate-selector-root" className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 font-sans tracking-tight">Candidates</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Manage and view profiles</p>
        </div>
        <button
          id="btn-toggle-add-candidate"
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors border border-slate-200"
          title="Add New Profile"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs animate-fadeIn">
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name</label>
              <input
                id="cand-new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Connection</label>
              <input
                id="cand-new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Initial Target Role</label>
              <input
                id="cand-new-role"
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Full Stack Engineer"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              id="btn-cancel-add-candidate"
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-[11px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-md"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-candidate"
              type="submit"
              className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-white font-medium rounded-md"
            >
              Initialize Profile
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative mb-3 flex items-center">
        <Search className="absolute left-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="candidate-search-box"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter candidate names..."
          className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-950 transition-all font-sans"
        />
      </div>

      {/* Candidate List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[300px] md:max-h-[500px]">
        {filtered.map((c) => {
          const isSelected = c.id === selectedCandidateId;
          const initials = c.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <button
              id={`candidate-row-${c.id}`}
              key={c.id}
              onClick={() => onSelectCandidate(c.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-center gap-3 relative ${
                isSelected
                  ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors shrink-0 ${
                  isSelected ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {initials || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs truncate">{c.name}</div>
                <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span className={`truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {c.currentRole}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            No candidates matched.
          </div>
        )}
      </div>
    </div>
  );
}
