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
  EyeOff,
  KeyRound,
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
  Circle,
  Upload,
  Download,
  FileText,
  FileImage,
  FileArchive,
  Paperclip,
  Lock
} from "lucide-react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  ChatMessage,
  ProjectDeliverable,
  DeliverablesMessage,
  DeliverablesChatMetadata
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
  clearSessionUnread,
  getDeliverables,
  saveDeliverable,
  deleteDeliverable,
  approveInquiryProject,
  checkProjectApproval,
  listenToDeliverablesMessages,
  sendDeliverablesMessage,
  listenToDeliverablesChats,
  listenToSingleDeliverablesChat,
  clearDeliverablesUnread,
  updateProjectStatus
} from "../lib/db";
import { DEFAULT_PAGE_CONTENT, DEFAULT_BLOGS, DEFAULT_CAREERS, DEFAULT_FAQS } from "../data/defaults";
import { useToast } from "./Toast";

export default function AdminView() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Real Firebase Email & Password authentication states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Show/Hide password toggle state
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

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
  
  // Project Deliverables & Document Management
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string; base64: string } | null>(null);
  const [deliverableForm, setDeliverableForm] = useState({
    clientEmail: "",
    fileName: "",
    description: "",
  });
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  // Deliverables Chat and Project Approval States
  const [deliverablesChatMessages, setDeliverablesChatMessages] = useState<DeliverablesMessage[]>([]);
  const [deliverablesChatMessageText, setDeliverablesChatMessageText] = useState("");
  const [isProjectApproved, setIsProjectApproved] = useState(false);
  const [selectedClientEmailForChat, setSelectedClientEmailForChat] = useState("");
  const [isManualEmailInput, setIsManualEmailInput] = useState(false);
  const [chatFileAttachment, setChatFileAttachment] = useState<{ name: string; size: string; type: string; base64: string } | null>(null);
  const [chatFileError, setChatFileError] = useState<string | null>(null);
  const [sendingChatFile, setSendingChatFile] = useState(false);
  const [deliverablesChats, setDeliverablesChats] = useState<DeliverablesChatMetadata[]>([]);
  const [clientChatMeta, setClientChatMeta] = useState<DeliverablesChatMetadata | null>(null);

  // Manual project approval states
  const [manualApprovalEmail, setManualApprovalEmail] = useState("");
  const [manualApprovalName, setManualApprovalName] = useState("");
  const [approvingEmailProgress, setApprovingEmailProgress] = useState(false);

  // Sub-tabs for layout simplification
  const [adminDeliverablesTab, setAdminDeliverablesTab] = useState<"files" | "chat" | "access">("files");
  const [clientDeliverablesTab, setClientDeliverablesTab] = useState<"files" | "chat">("files");

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
        setActiveTab("client_deliverables");
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

    // Subscribe to deliverables chats metadata
    let unsubscribeDeliverablesChats = () => {};
    let unsubscribeSingleDeliverablesChat = () => {};
    if (user.email === "somilsrivastav18@gmail.com") {
      unsubscribeDeliverablesChats = listenToDeliverablesChats((chats) => {
        setDeliverablesChats(chats);
      });
    } else if (user.email) {
      unsubscribeSingleDeliverablesChat = listenToSingleDeliverablesChat(user.email, (chat) => {
        setClientChatMeta(chat);
      });
    }

    return () => {
      unsubscribeChats();
      unsubscribeDeliverablesChats();
      unsubscribeSingleDeliverablesChat();
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

  // Subscribe to deliverables chat messages in real-time
  useEffect(() => {
    if (!user) return;
    
    let chatEmail = "";
    if (isAdmin) {
      if (selectedClientEmailForChat) {
        chatEmail = selectedClientEmailForChat;
      }
    } else {
      if (user.email) {
        chatEmail = user.email;
      }
    }

    if (!chatEmail) {
      setDeliverablesChatMessages([]);
      return;
    }

    // Clear unread count when opened
    clearDeliverablesUnread(chatEmail, isAdmin ? "admin" : "client");

    const unsubscribe = listenToDeliverablesMessages(chatEmail, (messages) => {
      setDeliverablesChatMessages(messages);
    });

    return () => unsubscribe();
  }, [user, isAdmin, selectedClientEmailForChat]);

  const loadAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isUserAdmin = user.email === "somilsrivastav18@gmail.com";
      const emailFilter = isUserAdmin ? undefined : user.email || undefined;

      const [page, inq, apps, bgs, crs, fqs, dels] = await Promise.all([
        getPageContent(),
        getInquiries(emailFilter),
        getJobApplications(emailFilter),
        getBlogs(),
        getCareers(),
        getFAQs(),
        getDeliverables(emailFilter)
      ]);

      setPageContent(page);
      setInquiries(inq);
      setApplications(apps);
      setBlogs(bgs);
      setCareers(crs);
      setFaqs(fqs);
      setDeliverables(dels);

      if (!isUserAdmin && user.email) {
        const approved = await checkProjectApproval(user.email);
        setIsProjectApproved(approved);
      }
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryError("Please enter your email address.");
      return;
    }
    setRecoverySubmitting(true);
    setRecoveryError(null);
    setRecoverySuccess(null);
    try {
      await sendPasswordResetEmail(auth, recoveryEmail.trim());
      setRecoverySuccess("Password reset instructions have been sent successfully. Please check your inbox and spam folders.");
    } catch (err: any) {
      console.error("Firebase reset password error:", err);
      let errorMsg = "Failed to send reset link. Please verify the email format or try again.";
      if (err?.code === "auth/user-not-found") {
        errorMsg = "No account found associated with this email address.";
      } else if (err?.code === "auth/invalid-email") {
        errorMsg = "Please provide a valid email address.";
      }
      setRecoveryError(errorMsg);
    } finally {
      setRecoverySubmitting(false);
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
      showToast("Unauthorized access. Only administrator somilsrivastav18@gmail.com is permitted to save configurations.", "error");
      return;
    }
    try {
      await updatePageContent(pageContent);
      showToast("Page configurations successfully saved and updated on production pipeline!", "success");
    } catch (err) {
      console.error(err);
      showToast("Error saving page configurations. Please check database latency.", "error");
    }
  };

  // Operations: Inquiry actions
  const handleUpdateInquiry = async (id: string, status: Inquiry["status"]) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can update inquiries.", "error");
      return;
    }
    try {
      await updateInquiryStatus(id, { status });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
      showToast(`Inquiry status updated to ${status}!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to update inquiry status.", "error");
    }
  };

  const handleInquiryReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can reply to inquiries.", "error");
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
          showToast(`Inquiry reply logged, but actual SMTP dispatch failed: "${smtpErrorDetail}". Fallback simulated log printed to container console.`, "warning", 6000);
        } else if (isSimulated) {
          showToast(`Inquiry reply logged. Email simulation backup printed to server console (no SMTP credentials configured).`, "info", 5000);
        } else {
          showToast(`Inquiry Response Email dispatched successfully to ${replyingInquiry.email}! Transaction logged.`, "success");
        }
      } else {
        showToast(`Inquiry reply logged to database, but SMTP server was unreachable or not configured. Verify your secrets credentials.`, "warning", 5000);
      }
      
      setReplyingInquiry(null);
      setReplyMessageText("");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit reply logs.", "error");
    } finally {
      setReplySubmitting(false);
    }
  };

  // Operations: Chat actions
  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can send messages through the Admin Chat console.", "error");
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
      showToast("Failed to send chat message.", "error");
    }
  };

  // Operations: Application actions
  const handleUpdateApplication = async (id: string, status: JobApplication["status"]) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can update job application status.", "error");
      return;
    }
    try {
      await updateApplicationStatus(id, status);
      setApplications(applications.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Job application status updated to ${status}!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to update job application status.", "error");
    }
  };

  // Operations: Reset DB defaults
  const handleResetDBDefaults = async () => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can reset database configurations.", "error");
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
      showToast("Database successfully reset and seeded with default configurations!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to reset database.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Blogs CRUD
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can save blog posts.", "error");
      return;
    }
    if (!editingBlog) return;

    try {
      await saveBlog(editingBlog);
      setEditingBlog(null);
      loadAdminData();
      showToast("Blog post saved successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to save blog post.", "error");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can delete blog posts.", "error");
      return;
    }
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteBlog(id);
      loadAdminData();
      showToast("Blog post deleted.", "info");
    } catch (e) {
      console.error(e);
      showToast("Failed to delete blog post.", "error");
    }
  };

  // Careers CRUD
  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can save career openings.", "error");
      return;
    }
    if (!editingCareer) return;

    try {
      await saveCareer(editingCareer);
      setEditingCareer(null);
      loadAdminData();
      showToast("Career opening saved!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to save career opening.", "error");
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can delete career openings.", "error");
      return;
    }
    if (!confirm("Delete this job post?")) return;
    try {
      await deleteCareer(id);
      loadAdminData();
      showToast("Career opening deleted.", "info");
    } catch (e) {
      console.error(e);
      showToast("Failed to delete career opening.", "error");
    }
  };

  // FAQs CRUD
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can save FAQs.", "error");
      return;
    }
    if (!editingFAQ) return;

    try {
      await saveFAQ(editingFAQ);
      setEditingFAQ(null);
      loadAdminData();
      showToast("FAQ item saved!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to save FAQ item.", "error");
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can delete FAQs.", "error");
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

  // --- PROJECT DELIVERABLES / SECURE DOCUMENT HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setFileError("File is too large. Maximum size is 800 KB for database storage security.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      let sizeStr = "";
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setSelectedFile({
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        base64: base64String,
      });
      setDeliverableForm(prev => ({ ...prev, fileName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFileError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setFileError("File is too large. Maximum size is 800 KB for database storage security.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      let sizeStr = "";
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setSelectedFile({
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        base64: base64String,
      });
      setDeliverableForm(prev => ({ ...prev, fileName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const clientEmail = isAdmin ? deliverableForm.clientEmail.trim() : user.email;
    
    if (!clientEmail) {
      showToast("Please specify the client email.", "error");
      return;
    }

    if (!selectedFile && !deliverableForm.fileName) {
      showToast("Please upload/select a file or specify a filename.", "error");
      return;
    }

    setUploadingDeliverable(true);
    try {
      const newDeliverable: ProjectDeliverable = {
        id: `del-${Date.now()}`,
        clientEmail: clientEmail.toLowerCase(),
        uploadedBy: user.email || "unknown",
        uploadedByName: isAdmin ? "TSDC Engineering Team" : (user.displayName || user.email?.split("@")[0] || "Client"),
        fileName: deliverableForm.fileName || selectedFile?.name || "unnamed_document",
        fileSize: selectedFile?.size || "1.0 KB",
        fileType: selectedFile?.type || "text/plain",
        uploadedAt: new Date().toISOString(),
        description: deliverableForm.description.trim() || "Project deliverable mockup or specification requirement.",
        fileData: selectedFile?.base64 || "data:text/plain;base64,TW9ja3VwIG9yIHJlcXVpcmVtZW50cyBkZWxpdmVyYWJsZQ=="
      };

      await saveDeliverable(newDeliverable);
      
      setDeliverableForm({
        clientEmail: "",
        fileName: "",
        description: "",
      });
      setSelectedFile(null);
      setFileError(null);
      
      await loadAdminData();
      showToast("Deliverable successfully uploaded and secured in client portal!", "success");
    } catch (err) {
      console.error("Error saving deliverable:", err);
      showToast("Error uploading deliverable. Please check file size constraints.", "error");
    } finally {
      setUploadingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async (id: string) => {
    if (!confirm("Are you sure you want to securely delete this document? This action is irreversible.")) return;
    try {
      await deleteDeliverable(id);
      await loadAdminData();
    } catch (err) {
      console.error("Error deleting deliverable:", err);
    }
  };

  const handleManualApproveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = manualApprovalEmail.trim().toLowerCase();
    if (!targetEmail) return;

    setApprovingEmailProgress(true);
    try {
      const matchedInquiries = inquiries.filter(i => i.email.toLowerCase() === targetEmail);

      if (matchedInquiries.length > 0) {
        for (const inq of matchedInquiries) {
          await approveInquiryProject(inq.id, true);
        }
        showToast(`Successfully approved project deliverables access for ${targetEmail}!`, "success");
      } else {
        await submitInquiry({
          name: manualApprovalName.trim() || "Authorized Client",
          email: targetEmail,
          subject: "Project Deliverables Authorization",
          message: "Account manually pre-authorized by Administrator for Project Deliverables access.",
          projectApproved: true
        });
        showToast(`Successfully pre-authorized and approved project deliverables access for ${targetEmail}.`, "success");
      }
      setManualApprovalEmail("");
      setManualApprovalName("");
      await loadAdminData();
    } catch (err) {
      console.error("Failed to approve client email:", err);
      showToast("An error occurred while approving the client email. Please try again.", "error");
    } finally {
      setApprovingEmailProgress(false);
    }
  };

  const handleToggleProjectApprovalByEmail = async (clientEmail: string, currentApproved: boolean) => {
    const action = currentApproved ? "revoke" : "grant";
    if (!confirm(`Are you sure you want to ${action} Project Deliverables board access for ${clientEmail}?`)) {
      return;
    }

    try {
      const targetEmail = clientEmail.toLowerCase().trim();
      const matchedInquiries = inquiries.filter(i => i.email.toLowerCase() === targetEmail);

      if (matchedInquiries.length > 0) {
        for (const inq of matchedInquiries) {
          await approveInquiryProject(inq.id, !currentApproved);
        }
        showToast(`Successfully ${currentApproved ? "revoked" : "approved"} access for ${clientEmail}.`, "success");
      } else {
        if (!currentApproved) {
          await submitInquiry({
            name: "Authorized Client",
            email: targetEmail,
            subject: "Project Deliverables Authorization",
            message: "Account manually pre-authorized by Administrator for Project Deliverables access.",
            projectApproved: true
          });
          showToast(`Successfully approved access for ${clientEmail}.`, "success");
        }
      }
      await loadAdminData();
    } catch (err) {
      console.error("Error toggling project approval:", err);
      showToast("Failed to update project approval status.", "error");
    }
  };

  const handleDownloadDeliverable = (del: ProjectDeliverable) => {
    try {
      const dataStr = del.fileData || "data:text/plain;base64,TW9ja3Vw";
      
      const matches = dataStr.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        const blob = new Blob([dataStr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = del.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = del.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      showToast("Could not process and download this file format.", "error");
    }
  };

  // --- DELIVERABLES CHAT & APPROVAL OPERATIONS ---
  const handleToggleProjectApproval = async (id: string, currentApprovedStatus: boolean) => {
    if (!isAdmin) {
      showToast("Unauthorized: Only administrator can approve client projects.", "error");
      return;
    }
    try {
      const newStatus = !currentApprovedStatus;
      await approveInquiryProject(id, newStatus);
      setInquiries(inquiries.map(i => i.id === id ? { ...i, projectApproved: newStatus } : i));
      showToast(`Project successfully ${newStatus ? "approved! The client can now securely access the Deliverables Portal." : "revoked."}`, "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to update project approval status.", "error");
    }
  };

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (1000 KB for database storage security)
    if (file.size > 1000 * 1024) {
      setChatFileError("File is too large. Maximum size is 1000 KB for database storage security.");
      return;
    }

    setChatFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      let sizeStr = "";
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setChatFileAttachment({
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        base64: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadChatFile = (fileName: string, fileData?: string) => {
    if (!fileData) {
      showToast("No file data attached to this message.", "warning");
      return;
    }
    try {
      const dataStr = fileData;
      const matches = dataStr.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        const blob = new Blob([dataStr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download chat file:", err);
      showToast("Could not process and download this file format.", "error");
    }
  };

  const handleSendDeliverablesMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let chatEmail = "";
    if (isAdmin) {
      if (!selectedClientEmailForChat) {
        showToast("Please select a client to chat with.", "warning");
        return;
      }
      chatEmail = selectedClientEmailForChat;
    } else {
      if (!user.email) return;
      chatEmail = user.email;
    }

    if (!deliverablesChatMessageText.trim() && !chatFileAttachment) {
      return;
    }

    const senderName = isAdmin 
      ? "TSDC Engineering Team" 
      : (user.displayName || user.email?.split("@")[0] || "Client");

    setSendingChatFile(true);
    try {
      await sendDeliverablesMessage(
        chatEmail,
        isAdmin ? "admin" : "client",
        senderName,
        deliverablesChatMessageText,
        chatFileAttachment
      );
      
      setDeliverablesChatMessageText("");
      setChatFileAttachment(null);
      setChatFileError(null);
      
      if (chatFileAttachment) {
        await loadAdminData();
      }
    } catch (err) {
      console.error("Error sending deliverables message:", err);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setSendingChatFile(false);
    }
  };

  const handleToggleProjectStatus = async (inquiryId: string, currentStatus?: "progress" | "done") => {
    const nextStatus = currentStatus === "done" ? "progress" : "done";
    try {
      await updateProjectStatus(inquiryId, nextStatus);
      // Update local state immediately for fast feedback
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, projectStatus: nextStatus } : i));
      showToast(`Project marked as ${nextStatus === "done" ? "Completed" : "In Progress"}!`, "success");
    } catch (err) {
      console.error("Failed to update project status:", err);
      showToast("Failed to update project status. Please try again.", "error");
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
 
          {forgotPasswordMode ? (
            <>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <KeyRound className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Recover Password</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Enter your registered email address, and we'll send you secure instructions to reset your master key.
                </p>
              </div>

              {recoveryError && (
                <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-rose-200 text-[11px] leading-relaxed font-mono">
                  <p className="font-bold uppercase tracking-wider text-rose-400 mb-0.5">Recovery Error:</p>
                  {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-emerald-200 text-[11px] leading-relaxed font-mono">
                  <p className="font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Success:</p>
                  {recoverySuccess}
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., somilsrivastav18@gmail.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs text-slate-200 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoverySubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {recoverySubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Request Reset Link
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setForgotPasswordMode(false);
                  setRecoverySuccess(null);
                  setRecoveryError(null);
                }}
                className="w-full text-center text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold transition-colors pt-2 block cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </>
          ) : (
            <>
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
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Password</label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(true);
                            setRecoveryEmail(email);
                            setRecoveryError(null);
                            setRecoverySuccess(null);
                          }}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl py-2.5 pl-4 pr-12 text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
            </>
          )}

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
                { id: "deliverables", label: `Project Deliverables (${deliverables.length})`, icon: FolderOpen },
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
                { id: "client_deliverables", label: `Project Documents (${deliverables.length})`, icon: FolderOpen },
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
                        onClick={() => handleToggleProjectApproval(inq.id, !!inq.projectApproved)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                          inq.projectApproved 
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25" 
                            : "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {inq.projectApproved ? "Approved Project" : "Approve Project"}
                      </button>

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
            ADMIN TAB: PROJECT DELIVERABLES
            ========================================= */}
        {activeTab === "deliverables" && isAdmin && (
          <div className="space-y-6" id="admin-deliverables-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-cyan-400" />
                  Client Project Deliverables Board
                </h1>
                <p className="text-xs text-slate-400">
                  Manage technical requirements, design mockups, and client documents securely. All artifacts are fully encrypted.
                </p>
              </div>
            </div>

            {/* Elegant Sub-navigation */}
            <div className="flex border-b border-slate-850 gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setAdminDeliverablesTab("files")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  adminDeliverablesTab === "files"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Files & Uploads ({deliverables.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminDeliverablesTab("chat")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  adminDeliverablesTab === "chat"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Secure Chat Workspace
                {(() => {
                  const totalUnreadDeliverablesCount = deliverablesChats.reduce((sum, c) => sum + (c.unreadCountAdmin || 0), 0);
                  if (totalUnreadDeliverablesCount > 0) {
                    return (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                        {totalUnreadDeliverablesCount} NEW
                      </span>
                    );
                  }
                  return null;
                })()}
              </button>
              <button
                type="button"
                onClick={() => setAdminDeliverablesTab("access")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  adminDeliverablesTab === "access"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Access Approvals ({inquiries.filter(i => i.projectApproved).length})
              </button>
            </div>

            {/* TAB CONTENT: FILES */}
            {adminDeliverablesTab === "files" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                {/* Left Column: Upload New Deliverable Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-2">
                      Upload Deliverable
                    </h3>

                    <form onSubmit={handleUploadDeliverable} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Client Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="client@company.com"
                          value={deliverableForm.clientEmail}
                          onChange={(e) => setDeliverableForm({ ...deliverableForm, clientEmail: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 font-mono"
                        />
                        <p className="text-[9px] text-slate-500 font-mono">Specify which client account can securely access this file.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Document Description *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="e.g. Figma wireframe mockup or Technical specifications requirements..."
                          value={deliverableForm.description}
                          onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed"
                        />
                      </div>

                      {/* File Upload Area */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">File Artifact *</label>
                        
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                            dragOver 
                              ? "border-cyan-400 bg-cyan-950/10" 
                              : selectedFile 
                              ? "border-emerald-500/50 bg-emerald-950/5" 
                              : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                          }`}
                          onClick={() => document.getElementById("admin-file-upload-input")?.click()}
                        >
                          <input
                            id="admin-file-upload-input"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          
                          {selectedFile ? (
                            <div className="space-y-2">
                              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                              <div className="text-xs font-bold text-white truncate max-w-[200px] mx-auto">
                                {selectedFile.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {selectedFile.size} • {selectedFile.type.split("/")[1]?.toUpperCase() || "FILE"}
                              </div>
                              <span className="text-[10px] text-cyan-400 hover:underline">Change File</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-slate-500 mx-auto animate-pulse" />
                              <p className="text-xs text-slate-300 font-medium">Drag & drop files here, or <span className="text-cyan-400 font-bold">browse</span></p>
                              <p className="text-[9px] text-slate-500">Supports PDF, TXT, PNG, JPG, ZIP (Max 800 KB)</p>
                            </div>
                          )}
                        </div>

                        {fileError && (
                          <p className="text-[10px] text-rose-400 font-mono mt-1">{fileError}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={uploadingDeliverable || (!selectedFile && !deliverableForm.fileName)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {uploadingDeliverable ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Encrypting & Saving...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Publish Deliverable
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: List of All Deliverables with Search/Filters */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                        Secured Documents Database ({deliverables.length})
                      </h3>
                      
                      {/* Search filter for emails */}
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Filter by client email..."
                          value={deliverableForm.clientEmail}
                          onChange={(e) => setDeliverableForm({ ...deliverableForm, clientEmail: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {deliverables.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-900">
                        <FolderOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                        <p>No deliverables matching the filter criteria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                        {deliverables
                          .filter(del => !deliverableForm.clientEmail || del.clientEmail.toLowerCase().includes(deliverableForm.clientEmail.toLowerCase()))
                          .map((del) => {
                            const isPdf = del.fileName.endsWith('.pdf');
                            const isImage = del.fileName.endsWith('.png') || del.fileName.endsWith('.jpg') || del.fileName.endsWith('.jpeg');
                            const isZip = del.fileName.endsWith('.zip');
                            
                            return (
                              <div 
                                key={del.id}
                                className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-9 w-9 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                                        {isPdf ? (
                                          <FileText className="h-5 w-5 text-rose-400" />
                                        ) : isImage ? (
                                          <FileImage className="h-5 w-5 text-emerald-400" />
                                        ) : isZip ? (
                                          <FileArchive className="h-5 w-5 text-amber-400" />
                                        ) : (
                                          <Paperclip className="h-5 w-5 text-cyan-400" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate max-w-[160px]" title={del.fileName}>
                                          {del.fileName}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-mono">
                                          {del.fileSize} • {new Date(del.uploadedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-cyan-400">
                                        {del.clientEmail.split("@")[0]}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                                    {del.description}
                                  </p>
                                </div>

                                <div className="border-t border-slate-850 pt-3 flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500 font-mono truncate max-w-[120px]">
                                    By: {del.uploadedByName}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadDeliverable(del)}
                                      className="p-1.5 bg-slate-950 border border-slate-850 text-cyan-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                      title="Secure Download"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDeliverable(del.id)}
                                      className="p-1.5 bg-slate-950 border border-slate-850 text-rose-400 hover:text-rose-300 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                                      title="Revoke / Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHAT */}
            {adminDeliverablesTab === "chat" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[550px] animate-fadeIn text-left">
                
                {/* Left Column (4 cols): Active Channels List with Unread Indicators & Status Toggles */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between max-h-[600px]" id="deliverables-chats-sidebar">
                  <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Project Channels</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualEmailInput(!isManualEmailInput);
                          setSelectedClientEmailForChat("");
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {isManualEmailInput ? "List View" : "Type Custom"}
                      </button>
                    </div>

                    {isManualEmailInput ? (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">Custom Client Email</label>
                        <input
                          type="email"
                          placeholder="e.g. client@example.com"
                          value={selectedClientEmailForChat}
                          onChange={(e) => setSelectedClientEmailForChat(e.target.value.trim().toLowerCase())}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 font-mono"
                        />
                        <p className="text-[9px] text-slate-500">Allows opening a workspace channel with any arbitrary client email address.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const emails = Array.from(new Set([
                            ...inquiries.filter(i => i.projectApproved).map(i => i.email.toLowerCase()),
                            ...deliverables.map(d => d.clientEmail.toLowerCase())
                          ]));

                          if (emails.length === 0) {
                            return (
                              <div className="text-center py-12 text-slate-600 text-xs">
                                <FolderOpen className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                                No approved project channels available. Create one in the Access Approvals tab!
                              </div>
                            );
                          }

                          return emails.map((email) => {
                            const matchedInq = inquiries.find(i => i.email.toLowerCase() === email);
                            const clientName = matchedInq?.name || "Pre-Approved Client";
                            const projectStatusVal = matchedInq?.projectStatus || "progress";
                            
                            // Find deliverablesChatMetadata for this email
                            const chatMeta = deliverablesChats.find(c => c.clientEmail === email);
                            const lastMsgText = chatMeta?.lastMessage || "No message logged yet";
                            const unreadCount = chatMeta?.unreadCountAdmin || 0;
                            const isSelected = selectedClientEmailForChat === email;

                            return (
                              <div 
                                key={email}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                                  isSelected 
                                    ? "bg-slate-900 border-cyan-500/50" 
                                    : "bg-slate-950 border-slate-850 hover:border-slate-800"
                                }`}
                              >
                                {/* Clickable session select area */}
                                <div 
                                  onClick={() => {
                                    setSelectedClientEmailForChat(email);
                                    clearDeliverablesUnread(email, "admin");
                                  }}
                                  className="cursor-pointer space-y-1.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-xs text-white leading-tight truncate block max-w-[120px]">{clientName}</span>
                                        {unreadCount > 0 && (
                                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider animate-pulse shrink-0">
                                            {unreadCount} NEW
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-500 font-mono block truncate">{email}</span>
                                    </div>
                                    
                                    {/* Small status indicator in sidebar list */}
                                    {projectStatusVal === "done" ? (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase shrink-0">
                                        Done
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono uppercase shrink-0">
                                        Active
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-slate-400 truncate leading-normal italic">{lastMsgText}</p>
                                </div>

                                {/* Project Done / Progress Control toggler - "make it easy for admin" */}
                                {matchedInq && (
                                  <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Status Control</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleProjectStatus(matchedInq.id, projectStatusVal)}
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                                          projectStatusVal === "done"
                                            ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                            : "bg-gradient-to-r from-emerald-600 to-teal-500 border-transparent text-slate-950 font-black hover:opacity-90 shadow"
                                        }`}
                                      >
                                        {projectStatusVal === "done" ? "Set Active" : "Mark Done"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (8 cols): Active Thread Chat Console */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between max-h-[600px]" id="deliverables-chat-console">
                  {selectedClientEmailForChat ? (
                    <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                      
                      {/* Thread Header with Project Information & Status Toggle */}
                      <div className="border-b border-slate-900 pb-3 flex justify-between items-center text-xs text-slate-400 flex-wrap gap-2">
                        {(() => {
                          const matchedInq = inquiries.find(i => i.email.toLowerCase() === selectedClientEmailForChat);
                          const clientName = matchedInq?.name || "Client";
                          const projectStatusVal = matchedInq?.projectStatus || "progress";
                          
                          return (
                            <>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap text-left">
                                  <span className="font-bold text-white text-sm">
                                    Chatting with: {clientName}
                                  </span>
                                  {projectStatusVal === "done" ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase rounded-full">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold uppercase rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                </div>
                                <span className="block text-[10px] text-slate-500 font-mono text-left">
                                  Channel: {selectedClientEmailForChat}
                                </span>
                              </div>

                              {matchedInq && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500 font-mono">Project status:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProjectStatus(matchedInq.id, projectStatusVal)}
                                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all border rounded-lg cursor-pointer flex items-center gap-1.5 ${
                                      projectStatusVal === "done"
                                        ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-transparent"
                                    }`}
                                  >
                                    {projectStatusVal === "done" ? (
                                      <>Reopen Project</>
                                    ) : (
                                      <>Mark Completed</>
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {deliverablesChatMessages.length === 0 ? (
                          <div className="text-center py-12 text-slate-600 text-xs">
                            <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                            No discussions logged yet. Send a secure handshake message or attachment to start!
                          </div>
                        ) : (
                          deliverablesChatMessages.map((msg) => {
                            const isMe = msg.sender === "admin";
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <span className="text-[9px] text-slate-500 mb-1 font-mono">{msg.senderName} ({msg.sender})</span>
                                <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-normal text-left ${
                                  isMe 
                                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 rounded-tr-none" 
                                    : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                                }`}>
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                  
                                  {/* Chat message file attachment */}
                                  {msg.fileName && (
                                    <div className="mt-2.5 p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {msg.fileType?.includes("image") ? (
                                          <FileImage className="h-4 w-4 text-cyan-400 shrink-0" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                          <p className="font-bold text-[11px] text-slate-200 truncate max-w-[150px]" title={msg.fileName}>{msg.fileName}</p>
                                          <p className="text-[9px] text-slate-500 font-mono">{msg.fileSize}</p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadChatFile(msg.fileName!, msg.fileData)}
                                        className="p-1.5 hover:bg-slate-850 text-cyan-400 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
                                        title="Download Attachment"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[8px] text-slate-600 mt-0.5 font-mono">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Chat Input & Attachment bar */}
                      <form onSubmit={handleSendDeliverablesMessage} className="border-t border-slate-900 pt-3 space-y-2">
                        {chatFileAttachment && (
                          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip className="h-3.5 w-3.5 text-cyan-400" />
                              <span className="font-bold text-slate-300 truncate max-w-[200px]">{chatFileAttachment.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono">({chatFileAttachment.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setChatFileAttachment(null)}
                              className="p-1 rounded text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {chatFileError && (
                          <p className="text-[10px] text-rose-400 font-mono">{chatFileError}</p>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById("admin-chat-file-input")?.click()}
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Attach File to Send"
                          >
                            <Paperclip className="h-4 w-4" />
                          </button>
                          <input
                            id="admin-chat-file-input"
                            type="file"
                            className="hidden"
                            onChange={handleChatFileChange}
                          />

                          <input
                            type="text"
                            placeholder="Type secure response regarding specifications..."
                            value={deliverablesChatMessageText}
                            onChange={(e) => setDeliverablesChatMessageText(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-300"
                          />
                          <button
                            type="submit"
                            disabled={sendingChatFile}
                            className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                          >
                            {sendingChatFile ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-24 text-slate-500 text-xs">
                      <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-3 animate-pulse" />
                      <p className="font-bold text-slate-300 text-sm mb-1">No Project Channel Selected</p>
                      <p className="text-slate-500 max-w-sm mx-auto">Please choose an active project channel or approved client from the list on the left to review messages, exchange assets, and toggle progress status.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: ACCESS CONTROL */}
            {adminDeliverablesTab === "access" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                {/* Left Column: Authorize Email form */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="border-b border-slate-900 pb-2">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                        Authorize Client Access
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        Pre-approve client emails or grant project folder access. Clients can log in to view specifications.
                      </p>
                    </div>

                    <form onSubmit={handleManualApproveEmail} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Client Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="client@company.com"
                          value={manualApprovalEmail}
                          onChange={(e) => setManualApprovalEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Client Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Corporation"
                          value={manualApprovalName}
                          onChange={(e) => setManualApprovalName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={approvingEmailProgress || !manualApprovalEmail}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {approvingEmailProgress ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            Authorize Client Access
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Authorized accounts list */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                        Currently Authorized Project Clients
                      </h3>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                        {inquiries.filter(i => i.projectApproved).length} Approved
                      </span>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
                      {Array.from(new Set(
                        inquiries.filter(i => i.projectApproved).map(i => JSON.stringify({ email: i.email.toLowerCase(), name: i.name }))
                      )).length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          <Lock className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                          <p>No custom clients authorized yet.</p>
                          <p className="text-[11px] text-slate-600 mt-1">Submit the authorization form on the left to activate client portals.</p>
                        </div>
                      ) : (
                        Array.from(new Set(
                          inquiries.filter(i => i.projectApproved).map(i => JSON.stringify({ email: i.email.toLowerCase(), name: i.name }))
                        )).map((itemStr: any) => {
                          const item = JSON.parse(itemStr) as { email: string; name: string };
                          return (
                            <div key={item.email} className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-200 font-mono truncate text-[11.5px]">{item.email}</p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.name || "Authorized Client Account"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleProjectApprovalByEmail(item.email, true)}
                                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/10 cursor-pointer shrink-0"
                              >
                                Revoke
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            CLIENT TAB: SECURE DOCUMENTS
            ========================================= */}
        {activeTab === "client_deliverables" && !isAdmin && (
          <div className="space-y-6" id="client-deliverables-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-cyan-400" />
                  Secure Project Deliverables & Documents
                </h1>
                <p className="text-xs text-slate-400">
                  Access design mockups, technical specifications, and system requirement deliverables published by our engineers.
                </p>
              </div>

              {isProjectApproved && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Project Status:</span>
                  {inquiries.find(i => i.projectApproved)?.projectStatus === "done" ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5 animate-pulse shrink-0" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping shrink-0" />
                      In Progress
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isProjectApproved ? (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4 my-12 shadow-xl">
                <Lock className="h-12 w-12 text-rose-500 mx-auto animate-pulse" />
                <h2 className="text-xl font-bold text-white">Project Deliverables Pending Approval</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your project environment is currently being initialized by our engineering team. 
                  Once our administrators review your inquiry/specifications and mark the project as <strong>Approved</strong>, 
                  this secure zone will unlock to let you review interactive wireframes, files, specs, and chat directly with our engineering team.
                </p>
                <div className="text-[10px] text-slate-500 font-mono bg-slate-900/60 inline-block px-4 py-1.5 rounded-lg border border-slate-800">
                  Secure Client Handshake Status: PENDING_ADMIN_HANDSHAKE
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Elegant Client Sub-navigation */}
                <div className="flex border-b border-slate-850 gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setClientDeliverablesTab("files")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      clientDeliverablesTab === "files"
                        ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                        : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                    }`}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Files & Documents ({deliverables.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientDeliverablesTab("chat")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      clientDeliverablesTab === "chat"
                        ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                        : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Secure Discussion Channel
                    {clientChatMeta && (clientChatMeta.unreadCountClient || 0) > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                        {clientChatMeta.unreadCountClient} NEW
                      </span>
                    )}
                  </button>
                </div>

                {/* CLIENT SUB-TAB: FILES & UPLOADS */}
                {clientDeliverablesTab === "files" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                    {/* Left Column: Client Upload Area */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="space-y-1 border-b border-slate-900 pb-2">
                          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Upload Reference File
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Need to share feedback, sketches, or a technical requirements doc? Securely upload it directly to your engineering team.
                          </p>
                        </div>

                        <form onSubmit={handleUploadDeliverable} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Short Description *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Describe what this file contains (e.g., Client feedback on wireframes)..."
                              value={deliverableForm.description}
                              onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed"
                            />
                          </div>

                          {/* Drag and Drop Zone */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">Select File *</label>
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                dragOver 
                                  ? "border-cyan-400 bg-cyan-950/10" 
                                  : selectedFile 
                                  ? "border-emerald-500/50 bg-emerald-950/5" 
                                  : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                              }`}
                              onClick={() => document.getElementById("client-file-upload-input")?.click()}
                            >
                              <input
                                id="client-file-upload-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              
                              {selectedFile ? (
                                <div className="space-y-2">
                                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                                  <div className="text-xs font-bold text-white truncate max-w-[200px] mx-auto">
                                    {selectedFile.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {selectedFile.size} • {selectedFile.type.split("/")[1]?.toUpperCase() || "FILE"}
                                  </div>
                                  <span className="text-[10px] text-cyan-400 hover:underline">Change File</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="h-8 w-8 text-slate-500 mx-auto animate-pulse" />
                                  <p className="text-xs text-slate-300 font-medium">Drag & drop files here, or <span className="text-cyan-400 font-bold">browse</span></p>
                                  <p className="text-[9px] text-slate-500">PDF, TXT, PNG, JPG, ZIP (Max 800 KB)</p>
                                </div>
                              )}
                            </div>

                            {fileError && (
                              <p className="text-[10px] text-rose-400 font-mono mt-1">{fileError}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={uploadingDeliverable || !selectedFile}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {uploadingDeliverable ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Encrypting & Saving...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3.5 w-3.5" />
                                Upload to Engineering Team
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right Column: Deliverables list */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-2">
                          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                            My Project Folders ({deliverables.length})
                          </h3>
                          <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                            AES-256 Encrypted handshake
                          </div>
                        </div>

                        {deliverables.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-900">
                            <FolderOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                            <p>No project documents or deliverables have been published yet.</p>
                            <p className="text-[11px] text-slate-600 mt-1">Upload a requirements doc on the left to start your engineering pipeline!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                            {deliverables.map((del) => {
                              const isPdf = del.fileName.endsWith('.pdf');
                              const isImage = del.fileName.endsWith('.png') || del.fileName.endsWith('.jpg') || del.fileName.endsWith('.jpeg');
                              const isZip = del.fileName.endsWith('.zip');
                              const isClientUploaded = del.uploadedBy.toLowerCase() === user.email?.toLowerCase();
                              
                              return (
                                <div 
                                  key={del.id}
                                  className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                                          {isPdf ? (
                                            <FileText className="h-5 w-5 text-rose-400" />
                                          ) : isImage ? (
                                            <FileImage className="h-5 w-5 text-emerald-400" />
                                          ) : isZip ? (
                                            <FileArchive className="h-5 w-5 text-amber-400" />
                                          ) : (
                                            <Paperclip className="h-5 w-5 text-cyan-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-white truncate max-w-[160px]" title={del.fileName}>
                                            {del.fileName}
                                          </h4>
                                          <p className="text-[10px] text-slate-500 font-mono">
                                            {del.fileSize} • {new Date(del.uploadedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        {isClientUploaded ? (
                                          <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                            My File
                                          </span>
                                        ) : (
                                          <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                            TSDC Team
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                                      {del.description}
                                    </p>
                                  </div>

                                  <div className="border-t border-slate-850 pt-3 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 font-mono">
                                      By: {isClientUploaded ? "You" : "TSDC Engineering"}
                                    </span>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDeliverable(del)}
                                        className="p-1.5 bg-slate-950 border border-slate-850 text-cyan-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                        title="Secure Download"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-bold uppercase font-mono tracking-wider px-0.5">Get</span>
                                      </button>
                                      {isClientUploaded && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDeliverable(del.id)}
                                          className="p-1.5 bg-slate-950 border border-slate-850 text-rose-400 hover:text-rose-300 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                                          title="Delete File"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CLIENT SUB-TAB: CHAT WORKSPACE */}
                {clientDeliverablesTab === "chat" && (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col h-[550px] max-w-4xl mx-auto animate-fadeIn">
                    <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4.5 w-4.5 text-cyan-400" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                            Direct Engineering Feedback Channel
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                            Discuss specifications and deliverables in real-time. Files uploaded here are archived instantly.
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-mono uppercase">
                        <Lock className="h-3 w-3" /> Encrypted
                      </span>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                      {deliverablesChatMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-600 text-xs">
                          <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                          No discussions logged. Share comments or upload reference files to get started!
                        </div>
                      ) : (
                        deliverablesChatMessages.map((msg) => {
                          const isMe = msg.sender === "client";
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                              <span className="text-[9px] text-slate-500 mb-1 font-mono">{msg.senderName}</span>
                              <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-normal ${
                                isMe 
                                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 rounded-tr-none" 
                                  : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                
                                {/* Chat message file attachment */}
                                {msg.fileName && (
                                  <div className="mt-2.5 p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {msg.fileType?.includes("image") ? (
                                        <FileImage className="h-4 w-4 text-cyan-400 shrink-0" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                                      )}
                                      <div className="min-w-0">
                                        <p className="font-bold text-[11px] text-slate-200 truncate max-w-[120px]" title={msg.fileName}>{msg.fileName}</p>
                                        <p className="text-[9px] text-slate-500 font-mono">{msg.fileSize}</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadChatFile(msg.fileName!, msg.fileData)}
                                      className="p-1.5 hover:bg-slate-850 text-cyan-400 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
                                      title="Download Attachment"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-600 mt-0.5 font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input & Attachment bar */}
                    <form onSubmit={handleSendDeliverablesMessage} className="border-t border-slate-900 pt-3 space-y-2">
                      {chatFileAttachment && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="font-bold text-slate-300 truncate max-w-[150px]">{chatFileAttachment.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">({chatFileAttachment.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setChatFileAttachment(null)}
                            className="p-1 rounded text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {chatFileError && (
                        <p className="text-[10px] text-rose-400 font-mono">{chatFileError}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById("client-chat-file-input")?.click()}
                          className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Attach Feedback / Sketch File"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <input
                          id="client-chat-file-input"
                          type="file"
                          className="hidden"
                          onChange={handleChatFileChange}
                        />

                        <input
                          type="text"
                          placeholder="Type message regarding specifications..."
                          value={deliverablesChatMessageText}
                          onChange={(e) => setDeliverablesChatMessageText(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-300"
                        />
                        <button
                          type="submit"
                          disabled={sendingChatFile}
                          className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                        >
                          {sendingChatFile ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
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
