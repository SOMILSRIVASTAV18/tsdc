import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Share2 
} from "lucide-react";
import { Blog } from "../types";
import { getBlogs } from "../lib/db";
import { DEFAULT_BLOGS } from "../data/defaults";

interface BlogsViewProps {
  activeBlogSlug?: string;
  onNavigate: (view: string, prefilledData?: any, slug?: string) => void;
}

export default function BlogsView({ activeBlogSlug, onNavigate }: BlogsViewProps) {
  const [blogs, setBlogs] = useState<Blog[]>(DEFAULT_BLOGS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (blogs.length > 0) {
      if (activeBlogSlug) {
        const found = blogs.find(b => b.slug === activeBlogSlug);
        if (found) {
          setActiveBlog(found);
        } else {
          setActiveBlog(null);
        }
      } else {
        setActiveBlog(null);
      }
    } else {
      setActiveBlog(null);
    }
  }, [blogs, activeBlogSlug]);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const categories = ["All", ...Array.from(new Set(blogs.map(blog => blog.category).filter(Boolean)))];

  const getAuthorInitials = (name: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAuthorBio = (authorName: string, authorRole?: string) => {
    if (authorName === "Somil Srivastava") {
      return "Co-Founder and Core System Engineer. Specializes in multi-tab database synchronizations, Express backend optimizations, and React web platforms.";
    }
    if (authorName === "Vaibhavi Keshari") {
      return "Co-Founder and Mobile Architect. Deep expert in Jetpack Compose, Kotlin system optimizations, local Room databases, and Google Play Store listing submissions.";
    }
    return `${authorRole || "Contributing Tech Author"}. Writes deep insights, clean engineering tutorials, and system architectural specifications.`;
  };

  const filteredBlogs = blogs.filter(blog => {
    if (selectedCategory === "All") return true;
    return blog.category === selectedCategory;
  });

  const handleShare = (blog: Blog) => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.summary,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Blog post URL copied to clipboard!");
    }
  };

  // Convert markdown-like content to simple paragraphs safely
  const renderContentHTML = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4"></div>;
      
      if (trimmed.startsWith("###")) {
        return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3">{trimmed.replace("###", "")}</h3>;
      }
      if (trimmed.startsWith("####")) {
        return <h4 key={idx} className="text-lg font-bold text-slate-800 mt-4 mb-2">{trimmed.replace("####", "")}</h4>;
      }
      if (trimmed.startsWith("-")) {
        return (
          <li key={idx} className="list-disc list-inside text-slate-650 text-slate-600 pl-4 text-sm leading-relaxed mb-1.5">
            {trimmed.replace("-", "").trim()}
          </li>
        );
      }
      return <p key={idx} className="text-slate-600 text-sm leading-relaxed mb-3">{trimmed}</p>;
    });
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16 sm:py-24" id="blogs-view-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* VIEW 1: SINGLE BLOG POST READER */}
        {activeBlog ? (
          <article className="max-w-3xl mx-auto space-y-8" id="blog-reader-view">
            
            {/* Breadcrumb / Back button */}
            <button
              onClick={() => onNavigate("blogs")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog Registry
            </button>

            {/* Post Hero Image */}
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img 
                src={activeBlog.imageUrl} 
                alt={activeBlog.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-600 text-white">
                  {activeBlog.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 leading-tight drop-shadow-sm">
                  {activeBlog.title}
                </h1>
              </div>
            </div>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4 text-xs text-slate-500 font-mono">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  {activeBlog.author} ({activeBlog.authorRole})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-455" />
                  {activeBlog.publishedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-455" />
                  {activeBlog.readTime}
                </span>
              </div>
              
              <button
                onClick={() => handleShare(activeBlog)}
                className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Article
              </button>
            </div>

            {/* Post Body Text */}
            <div className="prose max-w-none prose-sm" id="blog-content-body">
              {renderContentHTML(activeBlog.content)}
            </div>

            {/* Footer Author Bio */}
            <div className="border border-slate-200 bg-white p-6 rounded-2xl flex items-center gap-4 mt-12 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {getAuthorInitials(activeBlog.author)}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{activeBlog.author}</h4>
                <p className="text-xs text-slate-500">
                  {getAuthorBio(activeBlog.author, activeBlog.authorRole)}
                </p>
              </div>
            </div>

          </article>
        ) : (
          /* VIEW 2: ALL BLOGS LIST */
          <div className="space-y-12" id="blogs-registry-view">
            
            {/* Page Title */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                Technical Logs & Chronicles
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                THE SOFTWARE DEVELOPMENT COMPANY Architecture Blog
              </h1>
              <p className="text-slate-600">
                Insightful deep-dives into React architectures, Android performance optimizations, offline state sync caching, and secure API microservices written directly by our developers.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center" id="blog-category-filter">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">
                Loading technical articles...
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No articles matches category "{selectedCategory}" yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="blogs-grid">
                {filteredBlogs.map((blog) => (
                  <div 
                    key={blog.id} 
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm group transition-all duration-300"
                  >
                    
                    {/* Thumbnail Image */}
                    <div className="h-48 w-full overflow-hidden relative border-b border-slate-100">
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-blue-600 border border-slate-200 shadow-2xs">
                          {blog.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Summary */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>{blog.publishedAt}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{blog.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {blog.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          by {blog.author}
                        </span>
                        
                        <button
                          onClick={() => onNavigate("blogs", null, blog.slug)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          Read Article <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
