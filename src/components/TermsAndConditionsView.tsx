import React from "react";
import { FileText, Scale, ShieldAlert, ArrowLeft } from "lucide-react";

interface TermsAndConditionsViewProps {
  onNavigate: (view: string) => void;
}

export default function TermsAndConditionsView({ onNavigate }: TermsAndConditionsViewProps) {
  return (
    <div className="bg-slate-55 bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="terms-view">
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
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-xs font-mono text-slate-400">Effective Date: June 26, 2026 | TSDC Legal Compliance Standards</p>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-sans">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing this digital portal or employing any estimation algorithms, you agree to comply with THE SOFTWARE DEVELOPMENT COMPANY's technical specifications and system boundaries. These terms protect our active client listings (AK Industries, Pulse Rank, FinTrack Pro, Northern Railways Portal) and proprietary architectures.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              2. Estimator Calculations
            </h2>
            <p>
              The prices and durations provided by our Interactive Cost Estimator tool represent preliminary roadmap specifications. Binding quotes require formal architectural inspection by our lead engineers, culminating in a signed agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Code Property & Play Store Licensing</h2>
            <p>
              Unless explicitly specified under client custom purchase order agreements, THE SOFTWARE DEVELOPMENT COMPANY maintains development patent copyrights over structural frameworks, custom serverless edge caches, and backend orchestration modules built for custom products. Play Store credentials and final app binaries belong fully to the purchasing entity upon clearance of invoices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Dispute Resolution & Jurisdiction</h2>
            <p>
              These compliance terms are governed and interpreted under the commercial litigation laws of Lucknow, Uttar Pradesh, India. Any arbitration or administrative legal procedures shall be conducted solely under Lucknow municipal jurisdictions.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
