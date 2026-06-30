import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  Coins, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  X, 
  Send, 
  FileText, 
  User, 
  Mail, 
  Link2,
  Sparkles
} from "lucide-react";
import { Career } from "../types";
import { getCareers, submitJobApplication } from "../lib/db";
import { DEFAULT_CAREERS } from "../data/defaults";
import { useToast } from "./Toast";

export default function CareersView() {
  const { showToast } = useToast();
  const [careers, setCareers] = useState<Career[]>(DEFAULT_CAREERS);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [activeJobForModal, setActiveJobForModal] = useState<Career | null>(null);
  
  // Application form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadCareers() {
      try {
        const data = await getCareers();
        setCareers(data);
      } catch (e) {
        console.error("Error loading careers:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const departments = ["All", "Engineering", "Design", "Product"];

  const filteredCareers = careers.filter(job => {
    if (!job.open) return false;
    if (selectedDept === "All") return true;
    return job.department === selectedDept;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobForModal) return;

    setIsSubmitting(true);
    try {
      await submitJobApplication({
        careerId: activeJobForModal.id,
        jobTitle: activeJobForModal.title,
        name: fullName,
        email: email,
        portfolioUrl: portfolioUrl || undefined,
        githubUrl: githubUrl || undefined,
        resumeText: resumeText
      });
      setSubmitSuccess(true);
      // Reset form fields
      setFullName("");
      setEmail("");
      setPortfolioUrl("");
      setGithubUrl("");
      setResumeText("");
    } catch (err) {
      console.error("Error submitting job application:", err);
      showToast("Something went wrong. Please check your network and retry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="careers-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Careers at THE SOFTWARE DEVELOPMENT COMPANY
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Build Future-Proof Architectures
          </h1>
          <p className="text-slate-600">
            Work directly with our founding engineers to engineer secure, distributed mobile applications and client portals. We offer professional autonomy, transparent compensation, and high-impact project exposure.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10" id="careers-dept-filter">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedDept === dept
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Jobs Listings */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Scanning active career openings...
          </div>
        ) : filteredCareers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto shadow-2xs">
            No active positions listed in {selectedDept} currently. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto" id="jobs-listings-list">
            {filteredCareers.map((job) => (
              <div 
                key={job.id} 
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                      {job.department}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-2.5">{job.title}</h2>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-slate-400" />
                      {job.salary}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => {
                      setActiveJobForModal(job);
                      setSubmitSuccess(false);
                    }}
                    className="w-full md:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    View & Apply <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: JOB DETAIL & APPLY */}
        {activeJobForModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4" id="apply-modal">
            <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50">
                <div>
                  <span className="text-xs text-blue-600 font-bold tracking-wide uppercase">{activeJobForModal.department}</span>
                  <h3 className="text-xl font-bold text-slate-900">{activeJobForModal.title}</h3>
                </div>
                <button 
                  onClick={() => setActiveJobForModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {submitSuccess ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">Application Received!</h4>
                    <p className="text-slate-600 text-sm max-w-md mx-auto">
                      Your engineering resume profile has been safely saved to THE SOFTWARE DEVELOPMENT COMPANY's secure database. An automated notification email has been dispatched to our hiring team.
                    </p>
                    <button
                      onClick={() => setActiveJobForModal(null)}
                      className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-xs font-semibold text-white cursor-pointer shadow-xs"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left: Description */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Role Overview</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{activeJobForModal.description}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Key Requirements</h4>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {activeJobForModal.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Compensation & Perks</h4>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {activeJobForModal.benefits.map((ben, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{ben}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Application Form */}
                    <form onSubmit={handleApplySubmit} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        Application Details
                      </h4>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g., Alex Johnson"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Portfolio / Personal Site</label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://myportfolio.com"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">GitHub Link</label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/myusername"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Cover Letter & Key Skills</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <textarea
                            required
                            rows={3}
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Describe your technical background and experience working with React, Kotlin, or similar..."
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmitting ? "Uploading Details..." : "Submit Application"}
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
