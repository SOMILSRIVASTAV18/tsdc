import React from "react";
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react";

interface PrivacyPolicyViewProps {
  onNavigate: (view: string) => void;
}

export default function PrivacyPolicyView({ onNavigate }: PrivacyPolicyViewProps) {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="privacy-policy-view">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back button */}
        <button
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home Overview
        </button>

        <div className="space-y-4 border-b border-slate-200 pb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs font-mono text-slate-400">Effective Date: June 26, 2026 | TSDC Security Handshake Standard</p>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-sans">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              1. Information We Collect
            </h2>
            <p>
              At THE SOFTWARE DEVELOPMENT COMPANY, we value the integrity and privacy of our clients and web users. When you utilize our Project Estimator Calculator, submit specifications via the Inquiries Contact Form, or establish a Live Support Chat tunnel, we securely save standard identifier records:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-500 text-xs">
              <li>Full Name and Corporate Contact Credentials (Email, Phone)</li>
              <li>Calculated Project Configurations and desired architectural requirements</li>
              <li>Live chat support texts and correspondence logs</li>
              <li>Basic system telemetry data (IP logs, user-agent profiles)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              2. How We Secure Data
            </h2>
            <p>
              All client profiles and applications are securely persisted inside cryptographically locked NoSQL Google Firestore cloud database clusters. Communication streams utilize standard TLS 1.3 protocol channels, protecting transit payloads from interception or cross-site telemetry leakage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Third-Party Integrations & SDKs</h2>
            <p>
              We integrate secure SDKs to provide responsive client services (such as Firebase Authentication and Google Play Store verification engines). We never sell, rent, or trade your contact specifications to marketing compilers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Your Compliance Rights (GDPR / CCPA)</h2>
            <p>
              You have full autonomy to request a copy of your stored inquires logs, chat sessions, or candidate application resume profiles. To request immediate purge or deletion from TSDC Firestore nodes, submit a ticket to: <a href="mailto:somilsrivastav18@gmail.com" className="text-blue-600 hover:underline">somilsrivastav18@gmail.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
