import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Bell,
  ShieldCheck
} from "lucide-react";
import { submitInquiry } from "../lib/db";

interface ContactViewProps {
  prefilledData?: {
    subject?: string;
    message?: string;
  };
}

export default function ContactView({ prefilledData }: ContactViewProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Submission lifecycle states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackerStep, setTrackerStep] = useState(0);

  // Pre-fill effect if navigating from Estimator Calculator
  useEffect(() => {
    if (prefilledData) {
      if (prefilledData.subject) setSubject(prefilledData.subject);
      if (prefilledData.message) setMessage(prefilledData.message);
    }
  }, [prefilledData]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);
    setTrackerStep(1); // Step 1: Connecting to Firestore

    try {
      // Write transaction to Firebase Firestore
      await submitInquiry({
        name: fullName,
        email: email,
        subject: subject,
        message: message
      });

      // Animate tracker status sequence (optimized 300ms intervals for instant feel)
      setTimeout(() => {
        setTrackerStep(2); // Step 2: dispatch client email
        setTimeout(() => {
          setTrackerStep(3); // Step 3: dispatch admin notification
          setTimeout(() => {
            setTrackerStep(4); // Step 4: ticket opened successfully!
            setIsSubmitting(false);
            setSubmitted(true);
            
            // Clean up inputs on completion
            setFullName("");
            setEmail("");
            setSubject("");
            setMessage("");
          }, 300);
        }, 300);
      }, 300);

    } catch (err) {
      console.error("Error creating inquiry:", err);
      alert("Error logging secure inquiry. Please verify Firestore connectivity.");
      setIsSubmitting(false);
      setTrackerStep(0);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="contact-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Consultancy Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Engineer Your Application
          </h1>
          <p className="text-slate-655 text-slate-600">
            Submit your core specifications and feature goals. THE SOFTWARE DEVELOPMENT COMPANY reviews all applications and launches a dedicated tracking portal in less than 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* Left Col: Contact Info Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Direct Channels
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Skip generic templates. Connect directly with our lead architects to negotiate budgets, review design guidelines, or verify technical timelines.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              
              {/* Card 1: Email */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-850">
                  <Mail className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Email Us</p>
                  <a href="mailto:somilsrivastav18@gmail.com" className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline">
                    somilsrivastav18@gmail.com
                  </a>
                </div>
              </div>

              {/* Card 2: Phone */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-850">
                  <Phone className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Active Hotline (WhatsApp)</p>
                  <a href="tel:+917376787697" className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline">
                    +91 7376787697
                  </a>
                </div>
              </div>

              {/* Card 3: Location */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-850">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Operations Office</p>
                  <p className="text-sm font-bold text-slate-900">
                    Lucknow, Uttar Pradesh, India
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 font-mono">
              <p>✓ SLA Response Goal: Under 12 Hours</p>
              <p className="mt-1">✓ Firestore Database Secure Encryption Active</p>
            </div>

          </div>

          {/* Right Col: Interactive Submission Console */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
            
            {trackerStep > 0 && (
              /* PROGRESS TRACKER PANEL overlay/header */
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 animate-bounce text-blue-600" />
                  Live Notification Operations Log
                </h4>
                
                <div className="space-y-2 text-[11px] text-slate-700">
                  
                  {/* Step 1: Database payload */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${trackerStep >= 1 ? "bg-emerald-500" : "bg-slate-200"}`}></span>
                    <span className={trackerStep >= 1 ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {trackerStep === 1 ? "Saving your inquiry to our secure database..." : "✓ Inquiry saved to our secure database"}
                    </span>
                  </div>

                  {/* Step 2: Client Email confirmation */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${trackerStep >= 2 ? "bg-emerald-500" : "bg-slate-200 animate-pulse"}`}></span>
                    <span className={trackerStep >= 2 ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {trackerStep >= 2 ? "✓ Automatic confirmation email sent to your email" : "Waiting to send email confirmation..."}
                    </span>
                  </div>

                  {/* Step 3: Admin trigger alert */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${trackerStep >= 3 ? "bg-emerald-500" : "bg-slate-200 animate-pulse"}`}></span>
                    <span className={trackerStep >= 3 ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {trackerStep >= 3 ? "✓ Notification sent to administrator somilsrivastav18@gmail.com" : "Alerting administrator..."}
                    </span>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${trackerStep >= 4 ? "bg-emerald-500 animate-pulse" : "bg-slate-200"}`}></span>
                    <span className={trackerStep >= 4 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                      {trackerStep >= 4 ? "✓ Support ticket created successfully!" : "Finalizing ticket..."}
                    </span>
                  </div>

                </div>
              </div>
            )}

            {submitted ? (
              /* Success panel */
              <div className="text-center py-10 space-y-4 flex-1 flex flex-col justify-center items-center">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">Inquiry Saved Successfully!</h4>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Thank you for submitting your specifications. Our real-time notification engine has saved the record to Firestore and notified our leads.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setTrackerStep(0);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Submit Another specification
                </button>
              </div>
            ) : (
              /* Standard Form */
              <form onSubmit={handleInquirySubmit} className="space-y-4" id="contact-form">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Jane Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Your Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Subject / Scope</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cross-Platform Mobile App & Admin Portal"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Detailed Specifications & Budget Requirements</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide details about the target platforms (Android, Web, etc.), expected volume, and dynamic features required..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  id="contact-submit-btn"
                >
                  {isSubmitting ? "Persisting Payload & Syncing..." : "Transmit Specifications"}
                  <Send className="h-4 w-4" />
                </button>

              </form>
            )}

            {/* Privacy Shield Info */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>We value your privacy. All your project specifications are safely and securely stored in our cloud database.</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
