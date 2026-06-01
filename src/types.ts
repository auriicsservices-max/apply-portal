export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  preferredLocations: string[];
  experienceYears: number;
  currentRole: string;
  targetJobTitles: string[];
  skills: string[];
  domain: string;
  includeDomains: string[];
  excludeDomains: string[];
  includeKeywords?: string[];
  excludeKeywords?: string[];
  preferredSectors: string[];
  salaryExpectation: string;
  noticePeriod: string;
  workAuthorization: string;
  shiftPreference: string;
  resumeFilename: string;
  resumeText: string;
  linkedinUrl: string;
  portfolioUrl: string;
  countryPreference?: string;
}

export interface PortalCredential {
  candidateId: string;
  portalId: string; // e.g. "linkedin", "indeed", "glassdoor", "ziprecruiter", "naukri", "monster", "dice", "googlejobs", "company"
  portalName: string;
  enabled: boolean;
  username: string;
  passwordEncrypted: string; // Masked on the frontend, encrypted on the backend
  loginUrl: string;
  recoveryEmail?: string;
  verificationStatus: "not_connected" | "pending_verification" | "verified" | "login_failed" | "captcha_required" | "otp_required" | "session_expired" | "disabled";
  errorMessage?: string;
  lastVerifiedAt?: string;
  lastScrapedAt?: string;
  lastAppliedAt?: string;
  notes?: string;
  requiresOtpContent?: boolean; 
  captchaChallenge?: string;
}

export interface RealJob {
  id: string;
  candidateId: string;
  portalId: string;
  portalName: string;
  jobTitle: string;
  companyName: string;
  originalJobUrl: string;
  applyUrl: string;
  location: string;
  country: string;
  jobDescription: string;
  postedDate?: string;
  scrapedAt: string;
  portalJobId?: string;
  sourceVerificationStatus: "verified" | "unverified";
  matchScore: number;
  applyStatus: "scraped" | "applying" | "applied" | "failed" | "manual_review" | "expired";
  appliedAt?: string;
  errorLog?: string;
}

export interface PortalQuestion {
  id: string;
  candidateId: string;
  portalName: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  questionText: string;
  answerText?: string;
  answerSource?: "profile" | "resume" | "answer_bank" | "manual";
  questionType: "text" | "dropdown" | "radio" | "checkbox" | "yes_no" | "file_upload";
  required: boolean;
  options?: string[];
  dateAnswered?: string;
  isHighConfidence?: boolean;
}

export interface AnswerBankEntry {
  id: string;
  candidateId: string;
  questionKey: string;
  questionText: string;
  answerText: string;
}

export interface ApplicationLog {
  id: string;
  candidateId: string;
  candidateName: string;
  portalName: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  actionPerformed: string;
  status: "success" | "info" | "warning" | "error";
  errorMessage?: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  candidateId: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  createdAt: string;
  read: boolean;
}

export interface ManualReviewQueueItem {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  portalName: string;
  reason: "login_failed" | "captcha_required" | "otp_required" | "missing_profile_data" | "missing_resume" | "unknown_question" | "low_confidence_answer" | "job_link_expired" | "apply_button_not_found" | "portal_blocked_automation";
  description: string;
  questionToAnswer?: PortalQuestion;
  scrapedJob?: RealJob;
  createdAt: string;
}
