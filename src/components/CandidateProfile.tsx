import React, { useState, useEffect } from "react";
import { User, FileText, UploadCloud, Save, Loader2, Sparkles, AlertCircle, Link2 } from "lucide-react";
import { Candidate, AnswerBankEntry } from "../types";

interface Props {
  candidate: Candidate;
  onUpdateCandidate: (updated: Candidate) => Promise<void>;
  onParseResume: (text: string, filename: string) => Promise<any>;
  answerBank?: AnswerBankEntry[];
}

export default function CandidateProfile({ candidate, onUpdateCandidate, onParseResume, answerBank = [] }: Props) {
  const [formData, setFormData] = useState<Candidate>({ ...candidate });
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [copiedResumeText, setCopiedResumeText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(candidate.resumeFilename || "");

  useEffect(() => {
    setFormData({ ...candidate });
    setFileName(candidate.resumeFilename || "");
  }, [candidate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: keyof Candidate, value: string) => {
    const arr = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, [name]: arr }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateCandidate(formData);
    setIsSaving(false);
  };

  // Resume Drag & Drop + Copy-paste parsing simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      
      // Attempt reading file as text
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string || "";
        setCopiedResumeText(text);
        await triggerParse(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const triggerParse = async (text: string, fName: string) => {
    if (!text) return;
    setIsParsing(true);
    try {
      const updatedCand = await onParseResume(text, fName);
      if (updatedCand) {
        setFormData(updatedCand);
        setFileName(fName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualParseSubmit = () => {
    if (!copiedResumeText.trim()) return;
    triggerParse(copiedResumeText, "uploaded_resume_pasted.txt");
  };

  return (
    <div id="candidate-profile-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Candidate Profile Setup
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manually fill and customize individual resume details or parse automatically with Gemini.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 font-sans">
            ID: {candidate.id}
          </span>
        </div>
      </div>

      {/* SECTION A: Gemini AI Resume Parsing Handover */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-900">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>AI Parser & Resume Drag-and-Drop</span>
          </div>
          {fileName && (
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {fileName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* File Drag Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer border border-dashed rounded-xl p-4 text-center transition-all min-h-[110px] flex flex-col justify-center items-center ${
              dragActive 
                ? "border-slate-800 bg-slate-100/80 scale-[0.99]" 
                : "border-slate-200 bg-white hover:border-slate-400"
            }`}
          >
            <UploadCloud className="w-7 h-7 text-slate-400 mb-1.5" />
            <p className="text-[11px] font-medium text-slate-800">
              Drag & Drop candidate's resume PDF/text here
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulates auto-fill of missing details
            </p>
          </div>

          {/* Paste Clipboard alternative */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Paste raw resume text directly:
              </label>
              <textarea
                id="raw-resume-paster"
                rows={3}
                placeholder="Paste work experience, title, contacts, skills lists here..."
                value={copiedResumeText}
                onChange={(e) => setCopiedResumeText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950 resize-y"
              />
            </div>
            
            <button
              id="btn-parse-resume"
              type="button"
              onClick={handleManualParseSubmit}
              disabled={isParsing || !copiedResumeText.trim()}
              className="w-full py-1.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Parsing Resume with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze and Pre-fill Profile Fields
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION B: Comprehensive Fields Grid */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-3.5 text-xs text-slate-700">
          
          {/* Box 1 */}
          <div className="p-1 space-y-1">
            <span className="font-semibold text-slate-900 block mb-2 border-b border-slate-100 pb-1">1. Contact Identity</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Full Candidate Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 pr-1 px-2.5 py-1.5 rounded-lg text-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Email Connection</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Physical Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="p-1 space-y-1">
            <span className="font-semibold text-slate-900 block mb-2 border-b border-slate-100 pb-1">2. Domain & Skills</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Primary Job Domain</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineering"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Target Job Titles (Comma sep)</label>
                <input
                  type="text"
                  value={formData.targetJobTitles?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("targetJobTitles", e.target.value)}
                  placeholder="Senior Frontend, React Developer"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Core Tech Skills (Comma sep)</label>
                <input
                  type="text"
                  value={formData.skills?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("skills", e.target.value)}
                  placeholder="React, CSS, Node"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Current Job Title</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Box 3 */}
          <div className="p-1 space-y-1">
            <span className="font-semibold text-slate-900 block mb-2 border-b border-slate-100 pb-1">3. Preferences & Auth</span>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Exp Years</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears || 0}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Notice Period</label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={formData.noticePeriod || ""}
                    onChange={handleInputChange}
                    placeholder="2 weeks"
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Work Authorization</label>
                <input
                  type="text"
                  name="workAuthorization"
                  value={formData.workAuthorization || ""}
                  onChange={handleInputChange}
                  placeholder="US Citizen"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Salary Expectations</label>
                <input
                  type="text"
                  name="salaryExpectation"
                  value={formData.salaryExpectation || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. $140,000 - $160,000"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Preferred Locations (Comma sep)</label>
                <input
                  type="text"
                  value={formData.preferredLocations?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("preferredLocations", e.target.value)}
                  placeholder="San Francisco, CA, Remote"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Country Preference</label>
                <input
                  type="text"
                  name="countryPreference"
                  value={formData.countryPreference || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. United States, Canada"
                  className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Include/Exclude domain restrictions */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/40 p-4 rounded-xl border border-dashed border-slate-200">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Include Domains (e.g. SaaS)</label>
              <input
                type="text"
                value={formData.includeDomains?.join(", ") || ""}
                onChange={(e) => handleArrayChange("includeDomains", e.target.value)}
                placeholder="SaaS, FinTech, E-commerce"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Exclude Domains (e.g. Crypto)</label>
              <input
                type="text"
                value={formData.excludeDomains?.join(", ") || ""}
                onChange={(e) => handleArrayChange("excludeDomains", e.target.value)}
                placeholder="Crypto, Gambling"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Shift / Sectors Preference</label>
              <input
                type="text"
                name="shiftPreference"
                value={formData.shiftPreference || ""}
                onChange={handleInputChange}
                placeholder="Day Shift / Flexible"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 text-xs"
              />
            </div>
          </div>

          {/* Include/Exclude keyword restrictions */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/30 p-4 rounded-xl border border-dashed border-slate-200">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Include Keywords (Comma sep)</label>
              <input
                type="text"
                value={formData.includeKeywords?.join(", ") || ""}
                onChange={(e) => handleArrayChange("includeKeywords", e.target.value)}
                placeholder="e.g. React, TypeScript, Senior, Lead, Remote"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Exclude Keywords (Comma sep)</label>
              <input
                type="text"
                value={formData.excludeKeywords?.join(", ") || ""}
                onChange={(e) => handleArrayChange("excludeKeywords", e.target.value)}
                placeholder="e.g. PHP, Angular, Blockchain, Intern, Unpaid"
                className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950 text-xs"
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 pt-1">
            <div>
              <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-slate-400" /> LinkedIn Profile Link
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl || ""}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-slate-400" /> Portfolio or Custom Site URL
              </label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl || ""}
                onChange={handleInputChange}
                placeholder="https://john-doe.io"
                className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-950"
              />
            </div>
          </div>

          {/* Include a display of Saved Screening Answers */}
          <div className="md:col-span-2 lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 border-b border-slate-200/60 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Saved Screening Answers ({answerBank.length} pre-saved FAQs)</span>
            </div>
            {answerBank.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {answerBank.map((entry) => (
                  <div key={entry.id} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-800 block truncate" title={entry.questionText}>
                      Q: {entry.questionText}
                    </span>
                    <span className="text-slate-500 font-medium block italic truncate" title={entry.answerText}>
                      A: {entry.answerText}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 block">keyword: {entry.questionKey}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No custom screening questions saved yet. Any unknown application form questions solved via the manual exception hold will populate this answer bank automatically.</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            id="apply-profile-save"
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 hover:bg-slate-800 bg-slate-950 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Professional Profile
          </button>
        </div>
      </form>
    </div>
  );
}
