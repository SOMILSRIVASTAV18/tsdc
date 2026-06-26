import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ServicesView from "./components/ServicesView";
import CareersView from "./components/CareersView";
import BlogsView from "./components/BlogsView";
import FAQView from "./components/FAQView";
import ContactView from "./components/ContactView";
import AdminView from "./components/AdminView";
import PrivacyPolicyView from "./components/PrivacyPolicyView";
import TermsAndConditionsView from "./components/TermsAndConditionsView";
import LiveChatWidget from "./components/LiveChatWidget";
import { PageContent } from "./types";
import { getPageContent } from "./lib/db";
import { DEFAULT_PAGE_CONTENT } from "./data/defaults";
import { RefreshCw } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | undefined>(undefined);
  const [prefilledContactData, setPrefilledContactData] = useState<any>(null);
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_PAGE_CONTENT);
  const [contentLoading, setContentLoading] = useState(false);

  // 1. Pathname-based Routing Hook
  useEffect(() => {
    const parsePathRoute = () => {
      const pathname = window.location.pathname;
      const cleanPath = pathname.replace(/^\/+|\/+$/g, "");
      
      if (!cleanPath || cleanPath === "index.html") {
        setCurrentView("home");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "services.html") {
        setCurrentView("services");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "careers.html") {
        setCurrentView("careers");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "blogs.html") {
        setCurrentView("blogs");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "faq.html") {
        setCurrentView("faq");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "contact.html") {
        setCurrentView("contact");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "admin.html") {
        setCurrentView("admin");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "privacy-policy.html") {
        setCurrentView("privacy-policy");
        setActiveBlogSlug(undefined);
      } else if (cleanPath === "terms-and-conditions.html") {
        setCurrentView("terms-and-conditions");
        setActiveBlogSlug(undefined);
      } else {
        // Check if it's a blog page: blog-[slug].html
        const blogMatch = cleanPath.match(/^blog-(.+)\.html$/);
        if (blogMatch) {
          setCurrentView("blogs");
          setActiveBlogSlug(blogMatch[1]);
        } else {
          setCurrentView("home");
          setActiveBlogSlug(undefined);
        }
      }
    };

    parsePathRoute();
    window.addEventListener("popstate", parsePathRoute);
    return () => window.removeEventListener("popstate", parsePathRoute);
  }, []);

  // 2. Fetch page configurations from Firestore dynamically
  useEffect(() => {
    async function fetchContent() {
      try {
        const content = await getPageContent();
        setPageContent(content);
      } catch (err) {
        console.warn("Using fallback memory configurations.", err);
      } finally {
        setContentLoading(false);
      }
    }
    fetchContent();
  }, [currentView]); // Re-fetch occasionally when transitioning to keep synced with admin updates

  // Navigation controller
  const handleNavigate = (view: string, prefilledData?: any, slug?: string) => {
    if (prefilledData) {
      setPrefilledContactData(prefilledData);
    } else {
      setPrefilledContactData(null);
    }

    let targetPath = "/";
    if (view === "home") {
      targetPath = "/index.html";
    } else if (view === "services") {
      targetPath = "/services.html";
    } else if (view === "careers") {
      targetPath = "/careers.html";
    } else if (view === "blogs") {
      if (slug) {
        targetPath = `/blog-${slug}.html`;
      } else {
        targetPath = "/blogs.html";
      }
    } else if (view === "faq") {
      targetPath = "/faq.html";
    } else if (view === "contact") {
      targetPath = "/contact.html";
    } else if (view === "admin") {
      targetPath = "/admin.html";
    } else if (view === "privacy-policy") {
      targetPath = "/privacy-policy.html";
    } else if (view === "terms-and-conditions") {
      targetPath = "/terms-and-conditions.html";
    }

    window.history.pushState({}, "", targetPath);
    setCurrentView(view);
    setActiveBlogSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (contentLoading) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4" id="app-loading-screen">
        <div className="text-center space-y-4">
          <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
            {/* Ambient ping glow */}
            <div className="absolute inset-0 rounded-2xl bg-slate-900/10 animate-ping"></div>
            {/* Pulsing logo */}
            <div className="relative h-20 w-20 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center overflow-hidden p-1.5 animate-pulse">
              <img 
                src="/TSDC.png" 
                alt="TSDC Logo" 
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to text/default if image is temporarily unreadable
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-900 tracking-[0.18em] uppercase font-sans">THE SOFTWARE DEVELOPMENT COMPANY</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Launching digital pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased" id="main-app-container">
      
      {/* Universal Sticky Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Primary Routing Portal */}
      <main className="flex-grow" id="app-viewport">
        {currentView === "home" && (
          <HomeView pageContent={pageContent} onNavigate={handleNavigate} />
        )}
        {currentView === "services" && (
          <ServicesView onNavigate={handleNavigate} />
        )}
        {currentView === "careers" && (
          <CareersView />
        )}
        {currentView === "blogs" && (
          <BlogsView activeBlogSlug={activeBlogSlug} onNavigate={handleNavigate} />
        )}
        {currentView === "faq" && (
          <FAQView />
        )}
        {currentView === "contact" && (
          <ContactView prefilledData={prefilledContactData} />
        )}
        {currentView === "admin" && (
          <AdminView />
        )}
        {currentView === "privacy-policy" && (
          <PrivacyPolicyView onNavigate={handleNavigate} />
        )}
        {currentView === "terms-and-conditions" && (
          <TermsAndConditionsView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} contactEmail={pageContent.contactEmail} />

      {/* Real-time Floating Live Chat Widget */}
      <LiveChatWidget />

    </div>
  );
}
