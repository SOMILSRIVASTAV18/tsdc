import React from "react";
import { Menu, X, Code, Sparkles } from "lucide-react";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Home", view: "home" },
    { label: "Services", view: "services" },
    { label: "Careers", view: "careers" },
    { label: "Blogs", view: "blogs" },
    { label: "FAQ", view: "faq" },
    { label: "Contact Us", view: "contact" }
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100" id="main-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick("home")} id="header-logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-white shadow-sm overflow-hidden p-0.5">
              <img 
                src="/TSDC.png" 
                alt="TSDC Logo" 
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="ml-3 font-sans text-[11px] sm:text-xs md:text-sm font-black tracking-[0.18em] text-slate-900 uppercase">
              THE SOFTWARE DEVELOPMENT COMPANY
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === item.view
                    ? "bg-slate-100 text-slate-900 border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                id={`nav-${item.view}`}
              >
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => handleNavClick("admin")}
              className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                currentView === "admin"
                  ? "bg-slate-900 text-white border-slate-950 font-semibold"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
              }`}
              id="nav-admin-btn"
            >
              Client & Admin Portal
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 py-2 px-4 space-y-1 shadow-md" id="mobile-nav">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium ${
                currentView === item.view
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("admin")}
            className={`block w-full text-center mt-4 px-3 py-2.5 rounded-lg text-base font-medium border ${
              currentView === "admin"
                ? "bg-slate-900 text-white border-slate-950 font-semibold"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            Client & Admin Portal
          </button>
        </div>
      )}
    </header>
  );
}
