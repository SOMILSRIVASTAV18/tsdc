import React from "react";
import { Code, Link2, ExternalLink, ShieldCheck, Mail, ArrowUpRight } from "lucide-react";
import { CLIENT_PORTFOLIOS, CORE_TEAM } from "../data/defaults";

interface FooterProps {
  onNavigate: (view: string) => void;
  contactEmail: string;
}

export default function Footer({ onNavigate, contactEmail }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900" id="main-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Info */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate("home")} id="footer-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-white shadow-sm border border-slate-200 overflow-hidden p-0.5">
                <img 
                  src="/TSDC.png" 
                  alt="TSDC Logo" 
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to text/default if not found
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="ml-2 font-sans text-[11px] font-black tracking-[0.15em] text-white uppercase">
                THE SOFTWARE DEVELOPMENT COMPANY
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Elite engineering team producing enterprise websites and native Android apps with offline-first support and flawless scaling.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-2">
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-white hover:underline font-medium">{contactEmail}</a></p>
              <p>Loc: Lucknow, UP, India</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Corporate Directory
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("home")} className="hover:text-white transition-colors text-left">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("services")} className="hover:text-white transition-colors text-left">
                  Bespoke Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("careers")} className="hover:text-white transition-colors text-left">
                  Careers (We're Hiring!)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("blogs")} className="hover:text-white transition-colors text-left">
                  Engineering Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("faq")} className="hover:text-white transition-colors text-left">
                  Support FAQ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="hover:text-white transition-colors font-medium text-blue-400 hover:underline text-left">
                  Request Consultancy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Client Portals */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Featured Client Portals
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              {CLIENT_PORTFOLIOS.map((client) => (
                <li key={client.name} className="flex flex-col space-y-1">
                  <span className="text-slate-300 font-medium">{client.name}</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-400">
                    <a href={client.url} target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-0.5">
                      Website <ArrowUpRight className="h-3 w-3" />
                    </a>
                    {client.portalUrl && (
                      <a href={client.portalUrl} target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-0.5">
                        Portal <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                    {client.playStoreUrl && (
                      <a href={client.playStoreUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium">
                        Play Store <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Founders Portfolios */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Engineering Founders
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              {CORE_TEAM.map((founder) => (
                <li key={founder.name} className="flex flex-col">
                  <span className="text-slate-300 font-medium">{founder.name}</span>
                  <span className="text-slate-455 mb-1">{founder.role}</span>
                  <a 
                    href={founder.portfolioUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-400 hover:text-white hover:underline flex items-center gap-1 self-start"
                  >
                    View Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} THE SOFTWARE DEVELOPMENT COMPANY. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <button 
              onClick={() => onNavigate("privacy-policy")} 
              className="hover:text-slate-300 flex items-center gap-1"
              id="footer-privacy-link"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate("terms-and-conditions")} 
              className="hover:text-slate-300"
              id="footer-terms-link"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => onNavigate("admin")} 
              className="hover:text-white font-semibold text-slate-400"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
