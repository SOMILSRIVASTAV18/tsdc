import React from "react";
import { 
  ArrowRight, 
  CheckCircle, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { PageContent } from "../types";
import { CLIENT_PORTFOLIOS, CORE_TEAM } from "../data/defaults";

interface HomeViewProps {
  pageContent: PageContent;
  onNavigate: (view: string, prefilledData?: any) => void;
}

export default function HomeView({ pageContent, onNavigate }: HomeViewProps) {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen" id="home-view-container">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-white border-b border-slate-100" id="hero-section">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-cyan-300 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Left Col: Headings */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                <span>Next-Gen Enterprise Architects</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {pageContent.heroTitle}
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {pageContent.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button
                  onClick={() => onNavigate("contact")}
                  className="px-8 py-4 rounded-xl text-base font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                  id="hero-cta-button"
                >
                  {pageContent.heroCTA}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate("services")}
                  className="px-8 py-4 rounded-xl text-base font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Explore Our Services
                  <ChevronRight className="h-5 w-5 text-slate-450" />
                </button>
              </div>

              {/* Stack logos indicators */}
              <div className="pt-8 border-t border-slate-100 max-w-lg mx-auto lg:mx-0">
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  Enterprise-grade execution
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-600" /> Kotlin Native Android</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-600" /> React Web & Native</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-600" /> Secure Serverless API</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Bento Preview Card */}
            <div className="lg:col-span-5 mt-12 lg:mt-0 relative">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xl relative overflow-hidden" id="hero-bento-card">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">active_deployments.log</span>
                </div>
                
                <div className="space-y-4 font-mono text-xs text-slate-500">
                  <p className="text-blue-600 font-semibold"># Engineering Operations Overview</p>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/60 space-y-2 shadow-sm">
                    <p className="text-emerald-700 font-bold">● ACTIVE CLIENT PORTAL</p>
                    <p className="text-slate-800 text-sm font-semibold">AK Industries Ltd.</p>
                    <p className="text-slate-500">Industrial IoT and secure database control app successfully live on Google Play Store.</p>
                    <a href="https://play.google.com/store/apps/details?id=com.akindustries.app" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-1 text-[11px]">
                      View Listing <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                      <p className="text-blue-600 text-[11px]">PROJECT SYSTEM</p>
                      <p className="text-slate-800 font-semibold mt-0.5">Pulse Rank</p>
                      <p className="text-[10px] text-slate-400">Live SEO index analytics</p>
                      <a href="https://pulserank.in" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 mt-1 text-[10px]">
                        pulserank.in <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                      <p className="text-amber-600 text-[11px]">FINANCIAL INTEL</p>
                      <p className="text-slate-800 font-semibold mt-0.5">FinTrack Pro</p>
                      <p className="text-[10px] text-slate-400">Cloudflare edge sync</p>
                      <a href="https://fintrackproapp.netlify.app" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 mt-1 text-[10px]">
                        fintrackproapp <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-slate-100 border-y border-slate-200 py-10" id="stats-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {pageContent.aboutStats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MEET THE FOUNDERS SECTION */}
      <section className="py-20 lg:py-28 bg-white border-b border-slate-100" id="founders-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              The Engineering Co-Founders
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Symmetric Full-Stack Craftsmanship
            </h2>
            <p className="text-slate-500">
              Our firm is led by two senior engineers specializing in enterprise web portals and low-level native mobile applications. No outsourcing, no compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {CORE_TEAM.map((founder) => (
              <div 
                key={founder.name} 
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-6 md:p-8 space-y-6 transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xl shadow-sm">
                      {founder.avatar}
                    </div>
                    <a 
                      href={founder.portfolioUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
                    >
                      Personal Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{founder.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{founder.role}</p>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                  <span>Stack Specialist</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {founder.name === "Somil Srivastav" ? "React / Express / Serverless" : "Kotlin / Android / SDK Core"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLIENTS & CASE PROJECTS */}
      <section className="py-20 lg:py-28 bg-slate-50" id="portfolio-showcase-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center mb-16">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                Active Project Registry
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Engineered for Performance & Scalability
              </h2>
              <p className="text-slate-500">
                Explore a selected registry of live websites, client tracking portals, and mobile configurations built by our engineers. All links represent real deployments.
              </p>
            </div>
            <div className="lg:col-span-6 mt-6 lg:mt-0 flex lg:justify-end">
              <button
                onClick={() => onNavigate("services")}
                className="px-6 py-3 rounded-lg text-sm font-medium bg-white border border-slate-250 hover:bg-slate-100 text-slate-800 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                Explore Specialized Services <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="projects-grid">
            {CLIENT_PORTFOLIOS.map((client) => (
              <div 
                key={client.name} 
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                      {client.type}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold shadow-xs">
                      {client.logoLetter}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {client.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                  <a 
                    href={client.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Launch Website <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  {client.portalUrl && (
                    <a 
                      href={client.portalUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:underline font-semibold"
                    >
                      Management Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {client.playStoreUrl && (
                    <a 
                      href={client.playStoreUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:underline font-semibold"
                    >
                      Google Play Store <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {client.name === "FinTrack Pro" && (
                    <div className="w-full mt-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-slate-600 flex items-start gap-1.5 shadow-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-800">Play Store Deployment Pending:</span> Real-time serverless sync logs currently online at: <a href={client.workersUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">{client.workersUrl}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
