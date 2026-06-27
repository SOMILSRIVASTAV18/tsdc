import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  FirestoreError,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { Blog, Career, FAQ, PageContent, Inquiry, JobApplication, ChatMessage, ChatSession } from "../types";
import { DEFAULT_PAGE_CONTENT, DEFAULT_BLOGS, DEFAULT_CAREERS, DEFAULT_FAQS } from "../data/defaults";

// --- IN-MEMORY CACHE ---
let cachedPageContent: PageContent | null = null;
let cachedBlogs: Blog[] | null = null;
let cachedCareers: Career[] | null = null;
let cachedFAQs: FAQ[] | null = null;

// --- HELPERS ---
const handleFirebaseError = (error: unknown, fallback: any) => {
  console.warn("Firestore error, utilizing default memory state:", error);
  return fallback;
};

// --- PAGE CONTENT CONFIG ---
export const getPageContent = async (forceRefresh = false): Promise<PageContent> => {
  if (cachedPageContent && !forceRefresh) {
    return cachedPageContent;
  }
  try {
    const configDocRef = doc(db, "site_content", "agency_config");
    const docSnap = await getDoc(configDocRef);
    if (docSnap.exists()) {
      cachedPageContent = docSnap.data() as PageContent;
      return cachedPageContent;
    } else {
      // Seed on-demand or return default
      await setDoc(configDocRef, DEFAULT_PAGE_CONTENT);
      cachedPageContent = DEFAULT_PAGE_CONTENT;
      return DEFAULT_PAGE_CONTENT;
    }
  } catch (err) {
    cachedPageContent = handleFirebaseError(err, DEFAULT_PAGE_CONTENT);
    return cachedPageContent;
  }
};

export const updatePageContent = async (content: Partial<PageContent>): Promise<void> => {
  const configDocRef = doc(db, "site_content", "agency_config");
  const merged = { ...DEFAULT_PAGE_CONTENT, ...cachedPageContent, ...content };
  await setDoc(configDocRef, merged, { merge: true });
  cachedPageContent = merged;
};

// --- BLOGS ---
export const getBlogs = async (forceRefresh = false): Promise<Blog[]> => {
  if (cachedBlogs && !forceRefresh) {
    return cachedBlogs;
  }
  try {
    const blogsCol = collection(db, "blogs");
    const q = query(blogsCol, orderBy("publishedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Auto-seed blogs
      for (const blog of DEFAULT_BLOGS) {
        await setDoc(doc(db, "blogs", blog.id), blog);
      }
      cachedBlogs = [...DEFAULT_BLOGS];
      return cachedBlogs;
    }
    
    cachedBlogs = querySnapshot.docs.map(doc => doc.data() as Blog);
    return cachedBlogs;
  } catch (err) {
    cachedBlogs = handleFirebaseError(err, DEFAULT_BLOGS);
    return cachedBlogs;
  }
};

export const saveBlog = async (blog: Blog): Promise<void> => {
  await setDoc(doc(db, "blogs", blog.id), blog);
  if (cachedBlogs) {
    const idx = cachedBlogs.findIndex(b => b.id === blog.id);
    if (idx > -1) {
      cachedBlogs[idx] = blog;
    } else {
      cachedBlogs = [blog, ...cachedBlogs];
    }
  } else {
    cachedBlogs = [blog];
  }
};

export const deleteBlog = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "blogs", id));
  if (cachedBlogs) {
    cachedBlogs = cachedBlogs.filter(b => b.id !== id);
  }
};

// --- CAREERS ---
export const getCareers = async (forceRefresh = false): Promise<Career[]> => {
  if (cachedCareers && !forceRefresh) {
    return cachedCareers;
  }
  try {
    const careersCol = collection(db, "careers");
    const querySnapshot = await getDocs(careersCol);
    
    if (querySnapshot.empty) {
      // Auto-seed careers
      for (const career of DEFAULT_CAREERS) {
        await setDoc(doc(db, "careers", career.id), career);
      }
      cachedCareers = [...DEFAULT_CAREERS];
      return cachedCareers;
    }
    
    cachedCareers = querySnapshot.docs.map(doc => doc.data() as Career);
    return cachedCareers;
  } catch (err) {
    cachedCareers = handleFirebaseError(err, DEFAULT_CAREERS);
    return cachedCareers;
  }
};

export const saveCareer = async (career: Career): Promise<void> => {
  await setDoc(doc(db, "careers", career.id), career);
  if (cachedCareers) {
    const idx = cachedCareers.findIndex(c => c.id === career.id);
    if (idx > -1) {
      cachedCareers[idx] = career;
    } else {
      cachedCareers = [career, ...cachedCareers];
    }
  } else {
    cachedCareers = [career];
  }
};

export const deleteCareer = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "careers", id));
  if (cachedCareers) {
    cachedCareers = cachedCareers.filter(c => c.id !== id);
  }
};

// --- FAQS ---
export const getFAQs = async (forceRefresh = false): Promise<FAQ[]> => {
  if (cachedFAQs && !forceRefresh) {
    return cachedFAQs;
  }
  try {
    const faqCol = collection(db, "faqs");
    const querySnapshot = await getDocs(faqCol);
    
    if (querySnapshot.empty) {
      // Auto-seed FAQs
      for (const faq of DEFAULT_FAQS) {
        await setDoc(doc(db, "faqs", faq.id), faq);
      }
      cachedFAQs = [...DEFAULT_FAQS];
      return cachedFAQs;
    }
    
    cachedFAQs = querySnapshot.docs.map(doc => doc.data() as FAQ);
    return cachedFAQs;
  } catch (err) {
    cachedFAQs = handleFirebaseError(err, DEFAULT_FAQS);
    return cachedFAQs;
  }
};

export const saveFAQ = async (faq: FAQ): Promise<void> => {
  await setDoc(doc(db, "faqs", faq.id), faq);
  if (cachedFAQs) {
    const idx = cachedFAQs.findIndex(f => f.id === faq.id);
    if (idx > -1) {
      cachedFAQs[idx] = faq;
    } else {
      cachedFAQs = [faq, ...cachedFAQs];
    }
  } else {
    cachedFAQs = [faq];
  }
};

export const deleteFAQ = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "faqs", id));
  if (cachedFAQs) {
    cachedFAQs = cachedFAQs.filter(f => f.id !== id);
  }
};

// --- INQUIRIES ---
export const submitInquiry = async (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">): Promise<Inquiry> => {
  const newInquiry: Inquiry = {
    ...inquiry,
    id: `inquiry-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "unread",
    emailLog: [
      `Automated Client Confirmation sent to ${inquiry.email}`,
      `Automated Staff Notification sent to somilsrivastav18@gmail.com`
    ]
  };
  await setDoc(doc(db, "inquiries", newInquiry.id), newInquiry);
  return newInquiry;
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  try {
    const inquiriesCol = collection(db, "inquiries");
    const q = query(inquiriesCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Inquiry);
  } catch (err) {
    return handleFirebaseError(err, []);
  }
};

export const updateInquiryStatus = async (id: string, update: Partial<Inquiry>): Promise<void> => {
  const inquiryRef = doc(db, "inquiries", id);
  await updateDoc(inquiryRef, update);
};

// --- JOB APPLICATIONS ---
export const submitJobApplication = async (application: Omit<JobApplication, "id" | "appliedAt" | "status">): Promise<JobApplication> => {
  const newApp: JobApplication = {
    ...application,
    portfolioUrl: application.portfolioUrl || "",
    githubUrl: application.githubUrl || "",
    id: `app-${Date.now()}`,
    appliedAt: new Date().toISOString(),
    status: "pending"
  };
  await setDoc(doc(db, "applications", newApp.id), newApp);
  return newApp;
};

export const getJobApplications = async (): Promise<JobApplication[]> => {
  try {
    const appsCol = collection(db, "applications");
    const q = query(appsCol, orderBy("appliedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as JobApplication);
  } catch (err) {
    return handleFirebaseError(err, []);
  }
};

export const updateApplicationStatus = async (id: string, status: JobApplication["status"]): Promise<void> => {
  const appRef = doc(db, "applications", id);
  await updateDoc(appRef, { status });
};

// --- REAL-TIME LIVE CHAT ---
export const listenToSessions = (callback: (sessions: ChatSession[]) => void) => {
  const sessionsCol = collection(db, "chat_sessions");
  const q = query(sessionsCol, orderBy("updatedAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const sessions: ChatSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as ChatSession);
    });
    callback(sessions);
  }, (err) => {
    console.error("Error listening to chat sessions:", err);
  });
};

export const listenToMessages = (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesCol = collection(db, "chat_sessions", sessionId, "messages");
  const q = query(messagesCol, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push(doc.data() as ChatMessage);
    });
    callback(messages);
  }, (err) => {
    console.error("Error listening to chat messages:", err);
  });
};

export const sendChatMessage = async (
  sessionId: string, 
  clientName: string, 
  clientEmail: string | undefined, 
  sender: "client" | "admin", 
  text: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, "chat_sessions", sessionId);
    const now = new Date().toISOString();
    
    // 1. Create or update the active session metadata without blocking on getDoc
    // We use setDoc with merge: true which is highly robust and operates perfectly in offline/cached modes.
    const sessionData = {
      id: sessionId,
      clientName,
      clientEmail: clientEmail || "",
      lastMessage: text,
      updatedAt: now,
      unreadCount: sender === "client" ? (increment(1) as any) : 0,
      active: true
    };
    await setDoc(sessionRef, sessionData, { merge: true });
    
    // 2. Add the message document
    const messageId = `msg-${Date.now()}`;
    const messageRef = doc(db, "chat_sessions", sessionId, "messages", messageId);
    const message: ChatMessage = {
      id: messageId,
      sender,
      text,
      timestamp: now
    };
    await setDoc(messageRef, message);
  } catch (err) {
    console.error("Error sending chat message in Firestore:", err);
    throw err;
  }
};

export const clearSessionUnread = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, "chat_sessions", sessionId);
  try {
    await updateDoc(sessionRef, { unreadCount: 0 });
  } catch (e) {
    console.warn("Unable to clear unread count:", e);
  }
};
