import React from "react";
import { 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Database, 
  CheckCircle, 
  Workflow, 
  ArrowRight,
  Server
} from "lucide-react";

interface ServicesViewProps {
  onNavigate: (view: string, prefilledData?: any) => void;
}

export default function ServicesView({ onNavigate }: ServicesViewProps) {
  const services = [
    {
      id: "android-dev",
      title: "Native Android App Engineering",
      icon: Smartphone,
      subtitle: "High-Performance Mobile Systems",
      desc: "We construct robust native Android applications using Kotlin and Jetpack Compose. Specialized in low-resource memory optimizations, local room cache storage, and seamless publishing transitions for the Google Play Store.",
      deliverables: [
        "Google Play Store publishing and listings setup",
        "Fast offline database storage (app works without internet)",
        "Modern, clean, and beautiful user interfaces",
        "Instant push notifications and real-time updates"
      ],
      color: "from-emerald-500 to-teal-400"
    },
    {
      id: "web-dev",
      title: "Scalable React Web Development",
      icon: Globe,
      subtitle: "SEO-Optimized Enterprise-Grade Apps",
      desc: "Our web apps are engineered using React with Vite for fast load times and clean Tailwind CSS structures. We design responsive structures that achieve high indexability and fluid transition aesthetics.",
      deliverables: [
        "Beautiful bento-style layouts that look great on any screen size",
        "Super fast cloud servers so your website loads instantly",
        "Highly optimized code for maximum loading speed",
        "Search engine optimization (SEO) so Google finds you easily"
      ],
      color: "from-blue-600 to-cyan-500"
    },
    {
      id: "enterprise-portals",
      title: "Enterprise Client Portals & CMS",
      icon: ShieldCheck,
      subtitle: "Zero-Trust Secure Management Hubs",
      desc: "Secure portals for internal teams and external customers. Similar to the Northern Railways training model, we implement role-based access levels, real-time inquiry logging, and automated notification services.",
      deliverables: [
        "Secure user logins (such as admin vs. client roles)",
        "Real-time logs and live support helpdesks",
        "Automatic email notifications and alerts",
        "Manage content (blogs, jobs, text) easily without any coding"
      ],
      color: "from-violet-600 to-purple-500"
    },
    {
      id: "cloud-database",
      title: "Real-Time Cloud & SDK Integrations",
      icon: Database,
      subtitle: "Fail-Safe NoSQL Data Architectures",
      desc: "We integrate enterprise cloud databases and relational storage systems. We enable multi-tab browser caches, real-time message sync, and secure tokenized authentication.",
      deliverables: [
        "Auto-syncing databases (saves offline and uploads when online)",
        "Super fast real-time live chat systems",
        "Secure Google Login and email login options",
        "Fully encrypted database protection and security locks"
      ],
      color: "from-amber-500 to-orange-400"
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="services-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Service Spectrum
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Enterprise Digital Engineering
          </h1>
          <p className="text-slate-655 text-slate-600 text-lg">
            THE SOFTWARE DEVELOPMENT COMPANY produces reliable digital systems that accelerate transactions, automate operations, and present high-end visual brand credibility.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-16" id="services-list-container">
          {services.map((service, idx) => {
            const IconComponent = service.icon;

            return (
              <div 
                key={service.id} 
                className="flex flex-col lg:flex-row items-stretch gap-12 border border-slate-200 bg-white rounded-3xl p-8 lg:p-12 shadow-sm relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-slate-900"></div>

                {/* Left Side: Content */}
                <div className="flex-1 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-950 shadow-xs">
                        <IconComponent className="h-6 w-6 text-slate-800" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-bold tracking-wide uppercase">{service.subtitle}</p>
                        <h2 className="text-2xl font-bold text-slate-900">{service.title}</h2>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Standard Engineering Deliverables
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => onNavigate("contact", { subject: `Consultancy for ${service.title}` })}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Request Quote for this Service <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Right Side: Visual Mock/Telemetry */}
                <div className="w-full lg:w-80 shrink-0 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between font-mono text-xs text-slate-500">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[10px] uppercase text-blue-600 font-semibold">Security & QA Check</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-700">✓ lint_check: passed</p>
                      <p className="text-slate-700">✓ cross_platform: 100% compliant</p>
                      <p className="text-slate-700">✓ load_latency: &lt; 80ms</p>
                      <p className="text-slate-700">✓ encryption: SHA-256 standard</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200 space-y-2">
                    <p className="text-[10px] text-slate-400">PRODUCTION ENGINE DEPLOYED AT</p>
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700 truncate shadow-xs">
                      {service.id === "android-dev" ? "com.akindustries.app" : "fintrackproapp.netlify.app"}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* 6. TECHNICAL ARCHITECTURE STACK DIAGRAM */}
        <div className="mt-24 border border-slate-200 bg-white rounded-3xl p-8 lg:p-12 text-center space-y-8 shadow-xs" id="architecture-diagram-section">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Consolidated Client-Server Ecosystem</h2>
            <p className="text-slate-500 text-sm">
              We design synchronized cloud networks that enable offline client storage while updating cloud caches instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm max-w-4xl mx-auto items-center relative py-6">
            
            {/* Box 1: Client Node */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2">
              <Smartphone className="h-6 w-6 text-blue-600 mx-auto" />
              <p className="font-bold text-slate-800">Responsive App / Web Core</p>
              <p className="text-xs text-slate-500">React State Managers + Room SQLite Databases</p>
            </div>

            {/* Sync Line (Connector) */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2 border-dashed border-blue-500/50">
              <Workflow className="h-6 w-6 text-blue-600 mx-auto animate-spin" style={{ animationDuration: "12s" }} />
              <p className="font-bold text-blue-600">Real-Time Cloud Sync</p>
              <p className="text-xs text-slate-500">Offline-first local multi-tab cache protocol</p>
            </div>

            {/* Box 3: Cloud Node */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2">
              <Server className="h-6 w-6 text-blue-600 mx-auto" />
              <p className="font-bold text-slate-800">Secure Database Core</p>
              <p className="text-xs text-slate-500">Google Cloud / Cloudflare Serverless Workers</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
