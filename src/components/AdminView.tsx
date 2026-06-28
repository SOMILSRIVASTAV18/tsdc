import React, { useState, useEffect } from "react";
import { 
  LogIn, 
  LogOut, 
  Layers, 
  MessageSquare, 
  Inbox, 
  Users, 
  Briefcase, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Mail, 
  ExternalLink, 
  Eye, 
  Trash, 
  RefreshCw,
  Bell,
  Search,
  CheckSquare,
  ShieldCheck,
  Send,
  Save,
  CheckCircle2,
  FolderOpen,
  X,
  Circle
} from "lucide-react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User 
} from "../lib/firebase";
import { 
  Blog, 
  Career, 
  FAQ, 
  PageContent, 
  Inquiry, 
  JobApplication, 
  ChatSession, 
  ChatMessage 
} from "../types";
import { 
  getPageContent, 
  updatePageContent, 
  getBlogs, 
  saveBlog, 
  deleteBlog, 
  getCareers, 
  saveCareer, 
  deleteCareer, 
  getFAQs, 
  saveFAQ, 
  deleteFAQ, 
  getInquiries, 
  submitInquiry,
  updateInquiryStatus, 
  getJobApplications, 
  updateApplicationStatus, 
  listenToSessions, 
  listenToMessages, 
  sendChatMessage,
  clearSessionUnread
} from "../lib/db";
import { DEFAULT_PAGE_CONTENT, DEFAULT_BLOGS, DEFAULT_CAREERS, DEFAULT_FAQS } from "../data/defaults";

export default function AdminView() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Real Firebase Email & Password authentication states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Master State Managers
  const [activeTab, setActiveTab] = useState<string>("site");
  const [loading, setLoading] = useState(false);

  // Content databases
  const [pageContent, setPageContent] = useState<PageContent>(DEFAULT_PAGE_CONTENT);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>(DEFAULT_BLOGS);
  const [careers, setCareers] = useState<Career[]>(DEFAULT_CAREERS);
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS);

  // Selected chat session in real-time
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newAdminChatText, setNewAdminChatText] = useState("");

  // Selected inquiry for replying
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [replyMessageText, setReplyMessageText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Editors Modals & Creators State
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customAuthorMode, setCustomAuthorMode] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const isAdmin = user?.email === "somilsrivastav18@gmail.com";

  // Client portal specific states
  const [clientInquiryName, setClientInquiryName] = useState("");
  const [clientInquirySubject, setClientInquirySubject] = useState("");
  const [clientInquiryMessage, setClientInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  
  const [activeClientInquiry, setActiveClientInquiry] = useState<Inquiry | null>(null);
  const [activeClientApplication, setActiveClientApplication] = useState<JobApplication | null>(null);
  const [newClientChatText, setNewClientChatText] = useState("");
  const [clientChatSending, setClientChatSending] = useState(false);

  // Monitor Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Set active tab based on role
  useEffect(() => {
    if (user) {
      if (user.email === "somilsrivastav18@gmail.com") {
        setActiveTab("site");
      } else {
        setActiveTab("client_inquiries");
        setClientInquiryName(user.displayName || user.email?.split("@")[0] || "");
      }
    }
  }, [user]);

  // Fetch databases on login
  useEffect(() => {
    if (!user) return;
    loadAdminData();

    // Subscribe to chats sessions list in real-time
    const emailFilter = user.email === "somilsrivastav18@gmail.com" ? undefined : user.email;
    const unsubscribeChats = listenToSessions((sessions) => {
      setChatSessions(sessions);
    }, emailFilter);

    return () => {
      unsubscribeChats();
    };
  }, [user]);

  // Subscribe to selected chat session messages in real-time
  useEffect(() => {
    if (!user || !activeChatSessionId) return;

    const unsubscribeMessages = listenToMessages(activeChatSessionId, (messages) => {
      setChatMessages(messages);
    });

    return () => unsubscribeMessages();
  }, [user, activeChatSessionId]);

  const loadAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isUserAdmin = user.email === "somilsrivastav18@gmail.com";
      const emailFilter = isUserAdmin ? undefined : user.email || undefined;

      const [page, inq, apps, bgs, crs, fqs] = await Promise.all([
        getPageContent(),
        getInquiries(emailFilter),
        getJobApplications(emailFilter),
        getBlogs(),
        getCareers(),
        getFAQs()
      ]);

      setPageContent(page);
      setInquiries(inq);
      setApplications(apps);
      setBlogs(bgs);
      setCareers(crs);
      setFaqs(fqs);
    } catch (e) {
      console.error("Error loading user/admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Auth logins & Signups
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Google Sign-In failed:", err);
      setAuthError(err?.message || "Google Authentication failed. Please use Email/Password sign-in.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Email and Password are required.");
      return;
    }
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        if (email.trim().toLowerCase() === "somilsrivastav18@gmail.com") {
          throw new Error("Registration is disabled for the Administrator account. Please sign in instead.");
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.error("Firebase authentication error:", err);
      let errorMsg = "Authentication failed. Please verify your details.";
      if (err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        errorMsg = "Incorrect email or password. If you don't have an account, switch to 'Create Account' mode to register.";
      } else if (err?.code === "auth/email-already-in-use") {
        errorMsg = "This email is already in use. Please sign in instead.";
      } else if (err?.code === "auth/weak-password") {
        errorMsg = "Password is too weak. Must be at least 6 characters.";
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error, resetting state manually:", e);
    }
    setUser(null);
  };

  // Operations: Page Content update
  const handleSavePageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized access. Only administrator somilsrivastav18@gmail.com is permitted to save configurations.");
      return;
    }
    try {
      await updatePageContent(pageContent);
      alert("Page Content successfully updated!");
    } catch (err) {
      console.error(err);
      alert("Error saving page configurations.");
    }
  };

  // Operations: Inquiry actions
  const handleUpdateInquiry = async (id: string, status: Inquiry["status"]) => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can update inquiries.");
      return;
    }
    try {
      await updateInquiryStatus(id, { status });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
    } catch (e) {
      console.error(e);
    }
  };

  const handleInquiryReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can reply to inquiries.");
      return;
    }
    if (!replyingInquiry || !replyMessageText.trim()) return;

    setReplySubmitting(true);
    try {
      // 1. Dispatch real email through SMTP backend
      let mailSentSuccessfully = false;
      let isSimulated = false;
      let smtpErrorDetail = "";
      let extraLog = "";

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: replyingInquiry.email,
            subject: `RE: ${replyingInquiry.subject}`,
            html: `
              <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <div style="margin-bottom: 24px; border-bottom: 2px solid #0ea5e9; padding-bottom: 12px;">
                  <span style="font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #0ea5e9; font-family: monospace;">THE SOFTWARE DEVELOPMENT COMPANY</span>
                  <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-top: 4px; margin-bottom: 0;">Response to Your Inquiry</h2>
                </div>
                
                <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${replyingInquiry.name}</strong>,</p>
                
                <div style="font-size: 14px; color: #0f172a; line-height: 1.6; white-space: pre-wrap; background-color: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid #0ea5e9; margin: 24px 0;">
                  ${replyMessageText.replace(/\n/g, "<br />")}
                </div>
                
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;"><strong>Original Inquiry Subject:</strong> ${replyingInquiry.subject}</p>
                <p style="font-size: 12px; color: #94a3b8; font-style: italic;">"${replyingInquiry.message}"</p>
                
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0; font-family: monospace;">This email is sent on behalf of THE SOFTWARE DEVELOPMENT COMPANY Engineering Board.</p>
              </div>
            `
          })
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          mailSentSuccessfully = true;
          isSimulated = !!resData.simulated;
          if (resData.smtp_error) {
            smtpErrorDetail = resData.smtp_error;
            extraLog = " (Simulated due to SMTP auth/connection error)";
          } else {
            extraLog = resData.simulated ? " (Simulated Send)" : " (SMTP Transpatched)";
          }
        } else {
          console.warn("Mail server rejected send request:", resData.error);
        }
      } catch (mailErr) {
        console.error("Failed contacting email API server:", mailErr);
      }

      const updatedLogs = [
        ...(replyingInquiry.emailLog || []),
        `Inquiry Email Response sent at ${new Date().toLocaleString()}: "${replyMessageText.substring(0, 45)}..."${extraLog}`
      ];

      await updateInquiryStatus(replyingInquiry.id, {
        status: "replied",
        responseSent: replyMessageText,
        emailLog: updatedLogs
      });

      // Update local state
      setInquiries(inquiries.map(i => i.id === replyingInquiry.id ? { 
        ...i, 
        status: "replied", 
        responseSent: replyMessageText,
        emailLog: updatedLogs
      } : i));

      if (mailSentSuccessfully) {
        if (smtpErrorDetail) {
          alert(`Inquiry reply logged, but actual SMTP dispatch failed with login/auth error: "${smtpErrorDetail}".\n\nFallback simulated log successfully printed to the container server console. Please verify your Gmail App Password credentials.`);
        } else if (isSimulated) {
          alert(`Inquiry reply logged. Email simulation backup printed to server console (no SMTP credentials configured).`);
        } else {
          alert(`Inquiry Response Email dispatched successfully to ${replyingInquiry.email}! Transaction logged.`);
        }
      } else {
        alert(`Inquiry reply logged to database, but SMTP server was unreachable or not configured. Verify your .env / secrets credentials.`);
      }
      
      setReplyingInquiry(null);
      setReplyMessageText("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit reply logs.");
    } finally {
      setReplySubmitting(false);
    }
  };

  // Operations: Chat actions
  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can send messages through the Admin Chat console.");
      return;
    }
    if (!activeChatSessionId || !newAdminChatText.trim()) return;

    const textToSend = newAdminChatText;
    setNewAdminChatText("");

    try {
      // Find session to get name
      const session = chatSessions.find(s => s.id === activeChatSessionId);
      const name = session ? session.clientName : "Client";
      const email = session?.clientEmail;

      await sendChatMessage(
        activeChatSessionId,
        name,
        email,
        "admin",
        textToSend
      );
    } catch (e) {
      console.error("Error replying to chat:", e);
    }
  };

  // Operations: Application actions
  const handleUpdateApplication = async (id: string, status: JobApplication["status"]) => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can update job application status.");
      return;
    }
    try {
      await updateApplicationStatus(id, status);
      setApplications(applications.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Operations: Reset DB defaults
  const handleResetDBDefaults = async () => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can reset database configurations.");
      return;
    }
    if (!confirm("Are you sure you want to reset all site pages, blogs, FAQs, and careers to default configurations? This will overwrite manual changes.")) return;
    
    setLoading(true);
    try {
      await updatePageContent(DEFAULT_PAGE_CONTENT);
      
      // Seed Blogs
      for (const b of DEFAULT_BLOGS) {
        await saveBlog(b);
      }
      // Seed Careers
      for (const c of DEFAULT_CAREERS) {
        await saveCareer(c);
      }
      // Seed FAQs
      for (const f of DEFAULT_FAQS) {
        await saveFAQ(f);
      }

      await loadAdminData();
      alert("Database successfully reset and seeded with default configurations!");
    } catch (err) {
      console.error(err);
      alert("Failed to reset database.");
    } finally {
      setLoading(false);
    }
  };

  // Blogs CRUD
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can save blog posts.");
      return;
    }
    if (!editingBlog) return;

    try {
      await saveBlog(editingBlog);
      setEditingBlog(null);
      loadAdminData();
      alert("Blog post saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can delete blog posts.");
      return;
    }
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteBlog(id);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Careers CRUD
  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can save career openings.");
      return;
    }
    if (!editingCareer) return;

    try {
      await saveCareer(editingCareer);
      setEditingCareer(null);
      loadAdminData();
      alert("Career opening saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can delete career openings.");
      return;
    }
    if (!confirm("Delete this job post?")) return;
    try {
      await deleteCareer(id);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // FAQs CRUD
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can save FAQs.");
      return;
    }
    if (!editingFAQ) return;

    try {
      await saveFAQ(editingFAQ);
      setEditingFAQ(null);
      loadAdminData();
      alert("FAQ item saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!isAdmin) {
      alert("Unauthorized: Only administrator can delete FAQs.");
      return;
    }
    if (!confirm("Delete this FAQ item?")) return;
    try {
      await deleteFAQ(id);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4 admin-portal-loading">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 text-cyan-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-mono">Initializing secure portal authorization handshake...</p>
        </div>
      </div>
    );
  }

  // --- VIEW 1: SIGN IN PAGE ---
  if (!user) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4" id="admin-login-screen">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
 
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Login</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Securely authenticate to review client inquiries, chat with customers in real-time, and manage dynamic site layouts.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-rose-200 text-[11px] leading-relaxed font-mono">
              <p className="font-bold uppercase tracking-wider text-rose-400 mb-0.5">Authentication Error:</p>
              {authError}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., somilsrivastav18@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs text-slate-200 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {authSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  {authMode === "login" ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  {authMode === "login" ? "Launch Secure Session" : "Register Client Session"}
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-850"></div>
            <span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest font-mono">OR</span>
            <div className="flex-grow border-t border-slate-850"></div>
          </div>

          {/* Standard Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md uppercase tracking-wider"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" referrerPolicy="no-referrer" />
            Sign In with Google
          </button>

          {/* Privacy Footnote */}
          <p className="text-[10px] text-slate-600 text-center font-mono">
            Cloud Auth standard protocol SHA-256 enabled.
          </p>
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col md:flex-row" id="admin-authenticated-dashboard">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-850 p-6 flex flex-col justify-between shrink-0" id="admin-sidebar">
        <div className="space-y-8">
          
          {/* Logo / Header */}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white border border-slate-200 rounded-lg text-white font-bold flex items-center justify-center overflow-hidden p-0.5 shadow">
                <img src="/TSDC.png" alt="TSDC" className="h-full w-full object-contain" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{isAdmin ? "TSDC Control Hub" : "TSDC Client Portal"}</h3>
                <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Items list */}
          <nav className="space-y-1" id="admin-sidebar-nav">
            {isAdmin ? (
              [
                { id: "site", label: "Page Content (CMS)", icon: Layers },
                { id: "inquiries", label: `User Inquiries (${inquiries.filter(i => i.status === "unread").length})`, icon: Inbox },
                { id: "chats", label: `Live Chats (${chatSessions.filter(c => c.unreadCount > 0).length})`, icon: MessageSquare },
                { id: "applications", label: `Job Applications (${applications.filter(a => a.status === "pending").length})`, icon: Users },
                { id: "blogs", label: "Blogs Manager", icon: BookOpen },
                { id: "careers", label: "Careers Manager", icon: Briefcase },
                { id: "faqs", label: "FAQs Manager", icon: HelpCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveChatSessionId(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? "bg-slate-900 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            ) : (
              [
                { id: "client_inquiries", label: `My Inquiries (${inquiries.length})`, icon: Inbox },
                { id: "client_chats", label: `Support Chat`, icon: MessageSquare },
                { id: "client_applications", label: `My Applications (${applications.length})`, icon: Users },
                { id: "client_new_inquiry", label: "Submit New Inquiry", icon: Plus }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "client_chats") {
                        const existingSession = chatSessions.find(s => s.clientEmail === user.email);
                        if (existingSession) {
                          setActiveChatSessionId(existingSession.id);
                        } else {
                          setActiveChatSessionId(null);
                        }
                      } else {
                        setActiveChatSessionId(null);
                      }
                      setActiveClientInquiry(null);
                      setActiveClientApplication(null);
                      setInquirySuccess(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? "bg-slate-900 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            )}
          </nav>

        </div>

        {/* Footer controls */}
        <div className="space-y-4 pt-6 border-t border-slate-900">
          
          {/* User Signout */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
            <span className="truncate max-w-[100px] text-slate-300 font-medium">Session Active</span>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          </div>
        </div>

      </aside>

      {/* Main Console Board */}
      <main className="flex-1 bg-slate-900 p-6 md:p-10 overflow-y-auto max-h-screen" id="admin-main-console">
        
        {/* Loading overlay indicator */}
        {loading && (
          <div className="bg-slate-950/40 p-3 rounded-xl mb-6 flex items-center gap-2 text-xs font-mono text-cyan-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Synchronizing current configurations...</span>
          </div>
        )}

        {/* =========================================
            TAB 1: PAGE CONTENT (CMS) NO-CODE EDITOR
            ========================================= */}
        {activeTab === "site" && isAdmin && (
          <div className="space-y-8" id="admin-cms-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layers className="h-6 w-6 text-cyan-400" />
                  Page Contents Manager (No-Code updates)
                </h1>
                <p className="text-xs text-slate-400">
                  Update landing titles, about summaries, stats, and contact details without changing a single line of code.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePageContent} className="space-y-6 max-w-4xl bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl">
              
              {/* Section 1: Hero */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2 uppercase tracking-wider">1. Hero Section Content</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Hero Main Title</label>
                    <input
                      type="text"
                      required
                      value={pageContent.heroTitle}
                      onChange={(e) => setPageContent({ ...pageContent, heroTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Hero Subtitle</label>
                    <textarea
                      required
                      rows={3}
                      value={pageContent.heroSubtitle}
                      onChange={(e) => setPageContent({ ...pageContent, heroSubtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Hero Call To Action (CTA)</label>
                      <input
                        type="text"
                        required
                        value={pageContent.heroCTA}
                        onChange={(e) => setPageContent({ ...pageContent, heroCTA: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: About info */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2 uppercase tracking-wider">2. Profile & Mission</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">About Section Title</label>
                    <input
                      type="text"
                      required
                      value={pageContent.aboutTitle}
                      onChange={(e) => setPageContent({ ...pageContent, aboutTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">About Content Narrative</label>
                    <textarea
                      required
                      rows={4}
                      value={pageContent.aboutContent}
                      onChange={(e) => setPageContent({ ...pageContent, aboutContent: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact Channels */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2 uppercase tracking-wider">3. Operations Coordinates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={pageContent.contactEmail}
                      onChange={(e) => setPageContent({ ...pageContent, contactEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Hotline Phone</label>
                    <input
                      type="text"
                      required
                      value={pageContent.contactPhone}
                      onChange={(e) => setPageContent({ ...pageContent, contactPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">HQ Address</label>
                    <input
                      type="text"
                      required
                      value={pageContent.contactAddress}
                      onChange={(e) => setPageContent({ ...pageContent, contactAddress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-400/5"
              >
                <Save className="h-4 w-4" /> Save Page Content Configuration
              </button>
            </form>
          </div>
        )}

        {/* =========================================
            TAB 2: USER INQUIRIES & EMAIL SEND LOG
            ========================================= */}
        {activeTab === "inquiries" && isAdmin && (
          <div className="space-y-6" id="admin-inquiries-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Inbox className="h-6 w-6 text-cyan-400" />
                  Contact Inquiries Hub
                </h1>
                <p className="text-xs text-slate-400">
                  Track project specifications logged by web traffic. Send automated confirm email replies instantly.
                </p>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-950 border border-slate-850 rounded-2xl">
                No user inquiries logged in database yet.
              </div>
            ) : (
              <div className="space-y-4" id="inquiries-feed-list">
                {inquiries.map((inq) => (
                  <div 
                    key={inq.id} 
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow flex flex-col justify-between"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {inq.id}</span>
                        <h3 className="text-base font-bold text-white mt-1">{inq.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          inq.status === "unread" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          inq.status === "read" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {inq.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <p><span className="text-slate-500 uppercase font-bold text-[9px]">Sender:</span> <span className="text-slate-200 font-bold">{inq.name}</span> (<a href={`mailto:${inq.email}`} className="text-cyan-400 hover:underline">{inq.email}</a>)</p>
                      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 text-slate-300 whitespace-pre-wrap leading-normal font-sans">
                        {inq.message}
                      </div>
                    </div>

                    {/* Email confirmation logs */}
                    {inq.emailLog && inq.emailLog.length > 0 && (
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850/50 space-y-1.5">
                        <p className="text-[9px] uppercase font-bold text-slate-500 font-mono flex items-center gap-1.5">
                          <Bell className="h-3 w-3 text-cyan-400" />
                          SMTP Automated Notifications & Confirms
                        </p>
                        <ul className="text-[10px] text-slate-400 font-mono space-y-1">
                          {inq.emailLog.map((log, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-emerald-500 shrink-0">✓</span>
                              <span>{log}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-900 flex flex-wrap gap-2 justify-end">
                      {inq.status === "unread" && (
                        <button
                          onClick={() => handleUpdateInquiry(inq.id, "read")}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setReplyingInquiry(inq);
                          setReplyMessageText(`Hi ${inq.name.split(" ")[0]},\n\nThank you for sharing your project details with THE SOFTWARE DEVELOPMENT COMPANY!\n\nWe have successfully received your message about "${inq.subject}". Our engineering team is reviewing your requirements and budget. We will get back to you within 12 hours with a detailed roadmap and estimate.\n\nWarm regards,\nEngineering Team\nTHE SOFTWARE DEVELOPMENT COMPANY`);
                        }}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-[10px] font-bold text-slate-950 flex items-center gap-1 cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5" /> Send Reply Logs
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* POPUP: SEND INQUIRY REPLY LOG EMAIL */}
            {replyingInquiry && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-base text-white">Reply to Client Inquiries</h4>
                      <p className="text-[10px] text-slate-500">To: {replyingInquiry.name} ({replyingInquiry.email})</p>
                    </div>
                    <button 
                      onClick={() => setReplyingInquiry(null)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleInquiryReplySubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Subject Line</label>
                      <input 
                        type="text" 
                        disabled 
                        value={`RE: ${replyingInquiry.subject}`} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">SMTP Email Draft</label>
                      <textarea
                        required
                        rows={8}
                        value={replyMessageText}
                        onChange={(e) => setReplyMessageText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-slate-300 font-sans leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingInquiry(null)}
                        className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={replySubmitting}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 cursor-pointer"
                      >
                        {replySubmitting ? "Dispatching..." : "Send Automated Email"}
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================
            TAB 3: REAL-TIME SUPPORT LIVE CHAT CONSOLE
            ========================================= */}
        {activeTab === "chats" && isAdmin && (
          <div className="space-y-6" id="admin-chat-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-cyan-400" />
                  Live Chat Support Control Console
                </h1>
                <p className="text-xs text-slate-400">
                  Read active user threads in real-time. Respond instantly via support messaging channels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[450px]">
              
              {/* Left Column: Chat threads list */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4 max-h-[500px] overflow-y-auto">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Chat Sessions</h3>
                {chatSessions.length === 0 ? (
                  <p className="text-xs text-slate-600 py-6 text-center">No active chat sessions listed.</p>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setActiveChatSessionId(session.id);
                          clearSessionUnread(session.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          activeChatSessionId === session.id 
                            ? "bg-slate-900 border-cyan-500/50" 
                            : "bg-slate-950 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="space-y-1 max-w-[80%]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white leading-none block truncate max-w-[120px]">{session.clientName}</span>
                            {session.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold">
                                {session.unreadCount} NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{session.lastMessage}</p>
                        </div>
                        <span className="text-[8px] text-slate-600 font-mono self-start mt-0.5">
                          {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Active Thread chat messages lists */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between max-h-[500px]">
                {activeChatSessionId ? (
                  <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                    
                    {/* Thread Header */}
                    <div className="border-b border-slate-900 pb-2.5 flex justify-between items-center text-xs text-slate-400">
                      <div>
                        <span className="font-bold text-white text-sm">
                          Chatting with: {chatSessions.find(s => s.id === activeChatSessionId)?.clientName}
                        </span>
                        {chatSessions.find(s => s.id === activeChatSessionId)?.clientEmail && (
                          <span className="block text-[10px] text-slate-500">
                            Email: {chatSessions.find(s => s.id === activeChatSessionId)?.clientEmail}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
                        <Circle className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                        Connected
                      </span>
                    </div>

                    {/* Messages Logs Scroll list */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
                      {chatMessages.map((msg) => {
                        const isMe = msg.sender === "admin";
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div 
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${
                                isMe 
                                  ? "bg-cyan-500 text-slate-950 rounded-br-none font-medium" 
                                  : "bg-slate-900 border border-slate-850 text-slate-200 rounded-bl-none"
                              }`}
                            >
                              <p className="leading-relaxed break-words">{msg.text}</p>
                            </div>
                            <span className="text-[8px] text-slate-600 font-mono mt-1 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat sending input */}
                    <form onSubmit={handleSendAdminChat} className="flex gap-2 border-t border-slate-900 pt-3 shrink-0">
                      <input
                        type="text"
                        placeholder="Type reply to client..."
                        value={newAdminChatText}
                        onChange={(e) => setNewAdminChatText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-850 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-300"
                      />
                      <button
                        type="submit"
                        disabled={!newAdminChatText.trim()}
                        className="h-9 w-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 text-slate-600">
                    <MessageSquare className="h-10 w-10 text-slate-700 animate-pulse" />
                    <p className="text-xs max-w-xs">Select an active client session from the left column panel to establish a real-time responsive chat tunnel.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: JOB APPLICATIONS TRACKER
            ========================================= */}
        {activeTab === "applications" && isAdmin && (
          <div className="space-y-6" id="admin-applications-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-cyan-400" />
                  Candidate Applications Tracker
                </h1>
                <p className="text-xs text-slate-400">
                  Monitor engineering resumes and profile submissions saved from the Careers view.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-950 border border-slate-850 rounded-2xl">
                No job applications received currently.
              </div>
            ) : (
              <div className="space-y-4" id="applications-feed-tracker">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono">APP ID: {app.id}</span>
                        <h3 className="text-base font-bold text-white mt-1">{app.name}</h3>
                        <p className="text-xs text-cyan-400 font-medium">Applied for: {app.jobTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          app.status === "pending" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          app.status === "reviewed" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          app.status === "shortlisted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-slate-800 text-slate-500"
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <p><span className="text-slate-500 uppercase font-bold text-[9px]">Email:</span> <a href={`mailto:${app.email}`} className="text-cyan-400 hover:underline">{app.email}</a></p>
                      
                      <div className="flex gap-4 text-xs">
                        {app.portfolioUrl && (
                          <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                            Portfolio <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {app.githubUrl && (
                          <a href={app.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                            GitHub Code <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 text-slate-300 whitespace-pre-wrap font-sans">
                        {app.resumeText}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex justify-end gap-2">
                      {app.status === "pending" && (
                        <button
                          onClick={() => handleUpdateApplication(app.id, "reviewed")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateApplication(app.id, "shortlisted")}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-[10px] font-bold text-slate-950 cursor-pointer"
                      >
                        Shortlist Candidate
                      </button>
                      <button
                        onClick={() => handleUpdateApplication(app.id, "rejected")}
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 5: BLOGS MANAGER (CRUD)
            ========================================= */}
        {activeTab === "blogs" && isAdmin && (
          <div className="space-y-6" id="admin-blogs-crud-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                  Technical Blogs Manager
                </h1>
                <p className="text-xs text-slate-400 font-sans">Create and publish development logs to the Blogs section.</p>
              </div>
              <button
                onClick={() => {
                  setCustomCategoryMode(false);
                  setCustomAuthorMode(false);
                  setEditingBlog({
                    id: `blog-${Date.now()}`,
                    title: "",
                    slug: "",
                    summary: "",
                    content: "",
                    author: "Somil Srivastava",
                    authorRole: "Co-Founder",
                    category: "Cloud Engineering",
                    readTime: "5 min read",
                    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
                    publishedAt: new Date().toISOString().split("T")[0]
                  });
                }}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Publish New Blog
              </button>
            </div>

            {/* Blogs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-blogs-list">
              {blogs.map((b) => (
                <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 truncate">
                    <h3 className="text-xs text-cyan-400 font-bold font-mono">{b.category}</h3>
                    <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{b.title}</h4>
                    <p className="text-[10px] text-slate-500">by {b.author} • {b.publishedAt}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setCustomCategoryMode(false);
                        setCustomAuthorMode(false);
                        setEditingBlog(b);
                      }}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL: BLOG EDITOR/CREATOR */}
            {editingBlog && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white">Edit Blog Article</h3>
                    <button onClick={() => setEditingBlog(null)} className="p-1 rounded text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
                  </div>

                  <form onSubmit={handleSaveBlog} className="p-1 space-y-4 overflow-y-auto flex-1 mt-3">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500">Title</label>
                        <input
                          type="text" required
                          value={editingBlog.title}
                          onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Category</label>
                          <button
                            type="button"
                            onClick={() => setCustomCategoryMode(!customCategoryMode)}
                            className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                          >
                            {customCategoryMode ? "← Select List" : "✍️ Custom Category"}
                          </button>
                        </div>
                        {customCategoryMode ? (
                          <input
                            type="text" required
                            value={editingBlog.category}
                            onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none font-medium"
                            placeholder="Type custom category..."
                          />
                        ) : (
                          <select
                            value={editingBlog.category}
                            onChange={(e) => {
                              if (e.target.value === "__custom__") {
                                setCustomCategoryMode(true);
                              } else {
                                setEditingBlog({ ...editingBlog, category: e.target.value });
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none font-medium"
                          >
                            {Array.from(new Set([
                              "Cloud Engineering", 
                              "Mobile Systems", 
                              "Enterprise Security", 
                              ...blogs.map(b => b.category).filter(Boolean)
                            ])).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__custom__">✍️ Custom / New Category...</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Summary / Excerpt</label>
                      <input
                        type="text" required
                        value={editingBlog.summary}
                        onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Full Content Markdown / Plain Text</label>
                      <textarea
                        required rows={8}
                        value={editingBlog.content}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:outline-none rounded-lg p-2 text-xs text-slate-300 font-mono leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Author Name</label>
                          <button
                            type="button"
                            onClick={() => setCustomAuthorMode(!customAuthorMode)}
                            className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                          >
                            {customAuthorMode ? "← Select List" : "✍️ Custom Author"}
                          </button>
                        </div>
                        {customAuthorMode ? (
                          <input
                            type="text" required
                            value={editingBlog.author}
                            onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                            placeholder="Type custom author..."
                          />
                        ) : (
                          <select
                            value={editingBlog.author}
                            onChange={(e) => {
                              if (e.target.value === "__custom__") {
                                setCustomAuthorMode(true);
                              } else {
                                setEditingBlog({ ...editingBlog, author: e.target.value });
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none font-medium"
                          >
                            {Array.from(new Set([
                              "Somil Srivastava", 
                              "Vaibhavi Keshari", 
                              ...blogs.map(b => b.author).filter(Boolean)
                            ])).map(auth => (
                              <option key={auth} value={auth}>{auth}</option>
                            ))}
                            <option value="__custom__">✍️ Custom / New Author...</option>
                          </select>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500">Author Role</label>
                        <input
                          type="text" required
                          value={editingBlog.authorRole}
                          onChange={(e) => setEditingBlog({ ...editingBlog, authorRole: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Thumbnail URL</label>
                      <input
                        type="url" required
                        value={editingBlog.imageUrl}
                        onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                      <button type="button" onClick={() => setEditingBlog(null)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-bold text-slate-950">Save Article</button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================
            TAB 6: CAREERS OPENINGS MANAGER (CRUD)
            ========================================= */}
        {activeTab === "careers" && isAdmin && (
          <div className="space-y-6" id="admin-careers-crud-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-cyan-400" />
                  Job Openings Manager
                </h1>
                <p className="text-xs text-slate-400">Post and manage job positions dynamically.</p>
              </div>
              <button
                onClick={() => setEditingCareer({
                  id: `job-${Date.now()}`,
                  title: "",
                  department: "Engineering",
                  location: "Remote / Lucknow, India",
                  type: "Full-Time",
                  experience: "2+ Years",
                  salary: "₹8L - ₹12L / annum",
                  description: "",
                  requirements: ["Strong proficiency with React and TypeScript", "Excellent communication autonomy"],
                  benefits: ["Flexible remote autonomy", "Direct mentoring bonuses"],
                  open: true
                })}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Post New Role
              </button>
            </div>

            {/* Careers openings list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-careers-list">
              {careers.map((c) => (
                <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-[10px] text-slate-500">{c.department} • {c.location}</p>
                    <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ${c.open ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-850 text-slate-500"} mt-1.5`}>
                      {c.open ? "ACTIVE" : "CLOSED"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingCareer(c)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCareer(c.id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL: CAREER EDITOR */}
            {editingCareer && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white">Configure Job Listing</h3>
                    <button onClick={() => setEditingCareer(null)} className="p-1 rounded text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
                  </div>

                  <form onSubmit={handleSaveCareer} className="p-1 space-y-4 overflow-y-auto flex-1 mt-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Job Title</label>
                      <input
                        type="text" required
                        value={editingCareer.title}
                        onChange={(e) => setEditingCareer({ ...editingCareer, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Department</label>
                        <select
                          value={editingCareer.department}
                          onChange={(e) => setEditingCareer({ ...editingCareer, department: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                        >
                          <option>Engineering</option>
                          <option>Design</option>
                          <option>Product</option>
                          <option>Sales</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Role Status</label>
                        <select
                          value={editingCareer.open ? "Open" : "Closed"}
                          onChange={(e) => setEditingCareer({ ...editingCareer, open: e.target.value === "Open" })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                        >
                          <option>Open</option>
                          <option>Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Location</label>
                        <input
                          type="text" required
                          value={editingCareer.location}
                          onChange={(e) => setEditingCareer({ ...editingCareer, location: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Experience Bracket</label>
                        <input
                          type="text" required
                          value={editingCareer.experience}
                          onChange={(e) => setEditingCareer({ ...editingCareer, experience: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Salary Scale</label>
                        <input
                          type="text" required
                          value={editingCareer.salary}
                          onChange={(e) => setEditingCareer({ ...editingCareer, salary: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Role Summary & Responsibilities</label>
                      <textarea
                        required rows={3}
                        value={editingCareer.description}
                        onChange={(e) => setEditingCareer({ ...editingCareer, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                      <button type="button" onClick={() => setEditingCareer(null)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-bold text-slate-950">Save Listing</button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================
            TAB 7: FAQS MANAGER (CRUD)
            ========================================= */}
        {activeTab === "faqs" && isAdmin && (
          <div className="space-y-6" id="admin-faqs-crud-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-cyan-400" />
                  FAQs Manager
                </h1>
                <p className="text-xs text-slate-400">Add or refine answers shown on support accordion blocks.</p>
              </div>
              <button
                onClick={() => setEditingFAQ({
                  id: `faq-${Date.now()}`,
                  question: "",
                  answer: "",
                  category: "General"
                })}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Post New FAQ
              </button>
            </div>

            {/* FAQ open list */}
            <div className="grid grid-cols-1 gap-3 max-w-4xl" id="admin-faqs-list">
              {faqs.map((f) => (
                <div key={f.id} className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono">{f.category}</span>
                    <h4 className="text-sm font-bold text-white">{f.question}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{f.answer}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingFAQ(f)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(f.id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL: FAQ EDITOR */}
            {editingFAQ && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white">Configure FAQ accordion block</h3>
                    <button onClick={() => setEditingFAQ(null)} className="p-1 rounded text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
                  </div>

                  <form onSubmit={handleSaveFAQ} className="space-y-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Category</label>
                      <select
                        value={editingFAQ.category}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                      >
                        <option>General</option>
                        <option>Android Development</option>
                        <option>Web Development</option>
                        <option>Pricing</option>
                        <option>Security</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Question</label>
                      <input
                        type="text" required
                        value={editingFAQ.question}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Verifiable Answer</label>
                      <textarea
                        required rows={5}
                        value={editingFAQ.answer}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 font-sans leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                      <button type="button" onClick={() => setEditingFAQ(null)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-xs font-bold text-slate-950">Save FAQ</button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================
            CLIENT TAB 1: MY INQUIRIES
            ========================================= */}
        {activeTab === "client_inquiries" && (
          <div className="space-y-6" id="client-inquiries-panel">
            <div className="border-b border-slate-850 pb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Inbox className="h-6 w-6 text-cyan-400" />
                My Inquiries & Support Tickets
              </h1>
              <p className="text-xs text-slate-400">Track inquiries you have sent to TSDC Engineers and view response statuses.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inquiry list */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Submission Logs ({inquiries.length})</h3>
                {inquiries.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 text-center">
                    <p className="text-xs text-slate-500">No active inquiries filed under your email.</p>
                    <button onClick={() => setActiveTab("client_new_inquiry")} className="mt-3 text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1 justify-center mx-auto">
                      Submit an Inquiry now <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {inquiries.map((inq) => {
                      const isSelected = activeClientInquiry?.id === inq.id;
                      return (
                        <button
                          key={inq.id}
                          onClick={() => setActiveClientInquiry(inq)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-slate-800 border-cyan-500/55 shadow-lg" 
                              : "bg-slate-950 border-slate-850 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono text-slate-500">{new Date(inq.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              inq.status === "unread" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                              inq.status === "replied" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                              "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                              {inq.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{inq.subject}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inq.message}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Inquiry detail panel */}
              <div className="lg:col-span-2">
                {activeClientInquiry ? (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-slate-850 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Ticket Details</span>
                        <h2 className="text-lg font-bold text-white mt-1">{activeClientInquiry.subject}</h2>
                        <p className="text-xs text-slate-500">Submitted on {new Date(activeClientInquiry.createdAt).toLocaleString()} by {activeClientInquiry.name}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase self-start sm:self-center ${
                        activeClientInquiry.status === "unread" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                        activeClientInquiry.status === "replied" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {activeClientInquiry.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Original Client Message */}
                      <div className="space-y-1 bg-slate-900 border border-slate-850 p-4 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Original Inquiry Message:</span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{activeClientInquiry.message}</p>
                      </div>

                      {/* Response block */}
                      {activeClientInquiry.responseSent ? (
                        <div className="space-y-2.5 bg-cyan-950/20 border border-cyan-800/40 p-5 rounded-xl">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Official Response from TSDC Engineers</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{activeClientInquiry.responseSent}</p>
                        </div>
                      ) : (
                        <div className="bg-slate-900/50 border border-slate-850/50 p-4 rounded-xl text-center">
                          <p className="text-xs text-slate-500">Our engineering pipeline is checking your specifications. We will send a secured reply to your terminal shortly.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <Inbox className="h-12 w-12 text-slate-700 mb-3" />
                    <h3 className="font-bold text-sm text-slate-400">Select an inquiry ticket</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">Select any submitted ticket from the sidebar ledger to review response logs and feedback directly.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            CLIENT TAB 2: SUPPORT CHAT
            ========================================= */}
        {activeTab === "client_chats" && (
          <div className="space-y-6" id="client-chats-panel">
            <div className="border-b border-slate-850 pb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-cyan-400" />
                Live Chat Support
              </h1>
              <p className="text-xs text-slate-400">Converse directly with TSDC Engineers in a real-time support session.</p>
            </div>

            {activeChatSessionId ? (
              <div className="grid grid-cols-1 max-w-4xl bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl h-[550px] flex flex-col">
                {/* Header info */}
                <div className="bg-slate-900 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2.5 w-2.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-sm text-white">TSDC Support Bridge</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Session ID: {activeChatSessionId}</p>
                    </div>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950 flex flex-col">
                  {chatMessages.length === 0 ? (
                    <div className="text-center my-auto space-y-2">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 font-mono">Establishing secure handshake to chat nodes...</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.sender === "client";
                      return (
                        <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
                          <span className="text-[9px] text-slate-500 font-mono mb-1">{isMe ? "You" : "TSDC Engineer"}</span>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            isMe 
                              ? "bg-cyan-500 text-slate-950 font-semibold rounded-tr-none" 
                              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-600 font-mono mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Sender controls */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newClientChatText.trim() || clientChatSending) return;
                    setClientChatSending(true);
                    const text = newClientChatText;
                    setNewClientChatText("");
                    try {
                      await sendChatMessage(
                        activeChatSessionId,
                        user.displayName || user.email?.split("@")[0] || "Client",
                        user.email || undefined,
                        "client",
                        text
                      );
                    } catch (err) {
                      console.error("Client send message failed:", err);
                    } finally {
                      setClientChatSending(false);
                    }
                  }} 
                  className="bg-slate-900 p-4 border-t border-slate-850 flex gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Type your message to TSDC support..."
                    value={newClientChatText}
                    onChange={(e) => setNewClientChatText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!newClientChatText.trim() || clientChatSending}
                    className="px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-12 text-center max-w-xl shadow-xl flex flex-col items-center justify-center">
                <MessageSquare className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="font-bold text-base text-white">No active live chat session</h3>
                <p className="text-xs text-slate-400 mt-2 mb-6 max-w-sm leading-relaxed">
                  Open a secure, instant, real-time message tunnel directly with our engineers to ask technical inquiries or project consulting quotes.
                </p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    const sessId = `chat-${Date.now()}`;
                    try {
                      await sendChatMessage(
                        sessId,
                        user.displayName || user.email?.split("@")[0] || "Client",
                        user.email || undefined,
                        "client",
                        "Hello! I am logged into the portal and would like to start a real-time consulting session."
                      );
                      setActiveChatSessionId(sessId);
                    } catch (err) {
                      console.error("Failed to start client chat session:", err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Sparkles className="h-4 w-4" /> Start Live Chat Bridge
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            CLIENT TAB 3: MY APPLICATIONS
            ========================================= */}
        {activeTab === "client_applications" && (
          <div className="space-y-6" id="client-applications-panel">
            <div className="border-b border-slate-850 pb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-400" />
                My Job Applications
              </h1>
              <p className="text-xs text-slate-400">Review status logs of job applications you have submitted for active TSDC positions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications list */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Applications Ledger ({applications.length})</h3>
                {applications.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 text-center">
                    <p className="text-xs text-slate-500">No job applications submitted under your email.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {applications.map((app) => {
                      const isSelected = activeClientApplication?.id === app.id;
                      return (
                        <button
                          key={app.id}
                          onClick={() => setActiveClientApplication(app)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-slate-800 border-cyan-500/55 shadow-lg" 
                              : "bg-slate-950 border-slate-850 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              app.status === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                              app.status === "shortlisted" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                              app.status === "rejected" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                              "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{app.jobTitle}</h4>
                          <p className="text-[11px] text-slate-500 font-mono truncate">{app.name}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-2">
                {activeClientApplication ? (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="border-b border-slate-850 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Application Overview</span>
                        <h2 className="text-lg font-bold text-white mt-1">{activeClientApplication.jobTitle}</h2>
                        <p className="text-xs text-slate-500">Submitted on {new Date(activeClientApplication.appliedAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase self-start sm:self-center ${
                        activeClientApplication.status === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        activeClientApplication.status === "shortlisted" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        activeClientApplication.status === "rejected" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {activeClientApplication.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 border border-slate-850 rounded-xl">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Applicant Name:</span>
                          <p className="text-xs text-slate-300 font-semibold">{activeClientApplication.name}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Applicant Email:</span>
                          <p className="text-xs text-slate-300 font-mono">{activeClientApplication.email}</p>
                        </div>
                        {activeClientApplication.portfolioUrl && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Portfolio Site:</span>
                            <a href={activeClientApplication.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5">
                              Open Portfolio <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {activeClientApplication.githubUrl && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">GitHub Profile:</span>
                            <a href={activeClientApplication.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5">
                              Open GitHub <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 bg-slate-900 border border-slate-850 p-4 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Attached Cover Letter / Resume Details:</span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{activeClientApplication.resumeText}</p>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-850/60 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                          Evaluation Process Notice
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your credentials are authenticated directly under our recruitment cloud. Our talent acquisition pipeline will notify you on your registered email address if you are shortlisted for further technical rounds.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-slate-700 mb-3" />
                    <h3 className="font-bold text-sm text-slate-400">Select an application file</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">Select any submitted application ledger from the sidebar to review recruiter review stages.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            CLIENT TAB 4: SUBMIT NEW INQUIRY
            ========================================= */}
        {activeTab === "client_new_inquiry" && (
          <div className="space-y-6 max-w-3xl" id="client-new-inquiry-panel">
            <div className="border-b border-slate-850 pb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="h-6 w-6 text-cyan-400" />
                Submit New Inquiry Ticket
              </h1>
              <p className="text-xs text-slate-400">Describe your custom specifications, and TSDC Engineers will review them and reply directly inside this portal.</p>
            </div>

            {inquirySuccess ? (
              <div className="bg-emerald-950/20 border border-emerald-900 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                  <h3 className="font-bold text-base">Inquiry Successfully Filed!</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your inquiry has been successfully dispatched to TSDC Engineers under your registered account <strong>{user.email}</strong>. 
                  You can track its status, response logs, and direct replies inside the <strong>My Inquiries</strong> ledger.
                </p>
                <button
                  onClick={() => {
                    setInquirySuccess(null);
                    setActiveTab("client_inquiries");
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  View Inquiries List
                </button>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!clientInquirySubject.trim() || !clientInquiryMessage.trim() || submittingInquiry) return;
                  setSubmittingInquiry(true);
                  try {
                    await submitInquiry({
                      name: clientInquiryName.trim() || user.displayName || user.email?.split("@")[0] || "Client",
                      email: user.email || "",
                      subject: clientInquirySubject.trim(),
                      message: clientInquiryMessage.trim()
                    });
                    setInquirySuccess("Ticket filed successfully");
                    setClientInquirySubject("");
                    setClientInquiryMessage("");
                    loadAdminData();
                  } catch (err) {
                    console.error("Failed to file inquiry ticket:", err);
                  } finally {
                    setSubmittingInquiry(false);
                  }
                }}
                className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Your Display Name</label>
                    <input
                      type="text"
                      required
                      value={clientInquiryName}
                      onChange={(e) => setClientInquiryName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Registered Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="w-full bg-slate-900 border border-slate-850 text-xs text-slate-500 rounded-lg p-2.5 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Inquiry Subject / Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enterprise Web Application Quote"
                    value={clientInquirySubject}
                    onChange={(e) => setClientInquirySubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Detailed Message / Specifications</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Describe your design parameters, target platform requirements, and estimated timelines..."
                    value={clientInquiryMessage}
                    onChange={(e) => setClientInquiryMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    {submittingInquiry ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Dispatched Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Dispatch Support Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
