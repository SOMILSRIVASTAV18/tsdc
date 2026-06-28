import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  Search, 
  HelpCircle 
} from "lucide-react";
import { FAQ } from "../types";
import { getFAQs } from "../lib/db";
import { DEFAULT_FAQS } from "../data/defaults";

export default function FAQView() {
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFAQs() {
      try {
        const data = await getFAQs();
        setFaqs(data);
      } catch (err) {
        console.error("Error loading FAQs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFAQs();
  }, []);

  const categories = ["All", "General", "Android Development", "Web Development", "Pricing", "Security"];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="bg-slate-55 bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="faq-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            THE SOFTWARE DEVELOPMENT COMPANY Information Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600">
            Have questions about client integrations, security procedures, or native Android submissions? Find detailed, technical answers curated by our senior architects below.
          </p>
        </div>

        {/* Search and Filters Hub */}
        <div className="max-w-4xl mx-auto space-y-6 mb-12">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords (e.g., 'Play Store', 'caching', 'timelines')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-xs"
              id="faq-search-input"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center" id="faq-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setExpandedId(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Accordion Questions List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading FAQs...
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto shadow-2xs">
            No matching questions found. Try general keywords or choose another category tab.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4" id="faq-accordions">
            {filteredFAQs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs ${
                    isExpanded ? "border-slate-300 shadow-xs" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    id={`faq-btn-${faq.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className={`h-5 w-5 shrink-0 ${isExpanded ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <div className="shrink-0 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 transition-colors">
                      {isExpanded ? <Minus className="h-4 w-4 text-blue-600" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30" id={`faq-ans-${faq.id}`}>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-8">
                        {faq.answer}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between pl-8 text-[10px] text-slate-400 font-mono">
                        <span>FAQ Category: {faq.category}</span>
                        <span>Verified Answer ✓</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
