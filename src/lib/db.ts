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
  FirestoreError
} from "firebase/firestore";
import { db } from "./firebase";
import { Blog, Career, FAQ, PageContent, Inquiry, JobApplication, ChatMessage, ChatSession } from "../types";
import { DEFAULT_PAGE_CONTENT, DEFAULT_BLOGS, DEFAULT_CAREERS, DEFAULT_FAQS } from "../data/defaults";

// --- HELPERS ---
const handleFirebaseError = (error: unknown, fallback: any) => {
  console.warn("Firestore error, utilizing default memory state:", error);
  return fallback;
};

// --- PAGE CONTENT CONFIG ---
export const getPageContent = async (): Promise<PageContent> => {
  try {
    const configDocRef = doc(db, "site_content", "agency_config");
    const docSnap = await getDoc(configDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as PageContent;
    } else {
      // Seed on-demand or return default
      await setDoc(configDocRef, DEFAULT_PAGE_CONTENT);
      return DEFAULT_PAGE_CONTENT;
    }
  } catch (err) {
    return handleFirebaseError(err, DEFAULT_PAGE_CONTENT);
  }
};

export const updatePageContent = async (content: Partial<PageContent>): Promise<void> => {
  const configDocRef = doc(db, "site_content", "agency_config");
  await setDoc(configDocRef, { ...DEFAULT_PAGE_CONTENT, ...content }, { merge: true });
};

// --- BLOGS ---
export const getBlogs = async (): Promise<Blog[]> => {
  try {
    const blogsCol = collection(db, "blogs");
    const q = query(blogsCol, orderBy("publishedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Auto-seed blogs
      for (const blog of DEFAULT_BLOGS) {
        await setDoc(doc(db, "blogs", blog.id), blog);
      }
      return DEFAULT_BLOGS;
    }
    
    return querySnapshot.docs.map(doc => doc.data() as Blog);
  } catch (err) {
    return handleFirebaseError(err, DEFAULT_BLOGS);
  }
};

export const saveBlog = async (blog: Blog): Promise<void> => {
  await setDoc(doc(db, "blogs", blog.id), blog);
};

export const deleteBlog = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "blogs", id));
};

// --- CAREERS ---
export const getCareers = async (): Promise<Career[]> => {
  try {
    const careersCol = collection(db, "careers");
    const querySnapshot = await getDocs(careersCol);
    
    if (querySnapshot.empty) {
      // Auto-seed careers
      for (const career of DEFAULT_CAREERS) {
        await setDoc(doc(db, "careers", career.id), career);
      }
      return DEFAULT_CAREERS;
    }
    
    return querySnapshot.docs.map(doc => doc.data() as Career);
  } catch (err) {
    return handleFirebaseError(err, DEFAULT_CAREERS);
  }
};

export const saveCareer = async (career: Career): Promise<void> => {
  await setDoc(doc(db, "careers", career.id), career);
};

export const deleteCareer = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "careers", id));
};

// --- FAQS ---
export const getFAQs = async (): Promise<FAQ[]> => {
  try {
    const faqCol = collection(db, "faqs");
    const querySnapshot = await getDocs(faqCol);
    
    if (querySnapshot.empty) {
      // Auto-seed FAQs
      for (const faq of DEFAULT_FAQS) {
        await setDoc(doc(db, "faqs", faq.id), faq);
      }
      return DEFAULT_FAQS;
    }
    
    return querySnapshot.docs.map(doc => doc.data() as FAQ);
  } catch (err) {
    return handleFirebaseError(err, DEFAULT_FAQS);
  }
};

export const saveFAQ = async (faq: FAQ): Promise<void> => {
  await setDoc(doc(db, "faqs", faq.id), faq);
};

export const deleteFAQ = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "faqs", id));
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
  const sessionRef = doc(db, "chat_sessions", sessionId);
  const now = new Date().toISOString();
  
  // 1. Create or update the active session metadata
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) {
    const newSession: ChatSession = {
      id: sessionId,
      clientName,
      clientEmail,
      lastMessage: text,
      updatedAt: now,
      unreadCount: sender === "client" ? 1 : 0,
      active: true
    };
    await setDoc(sessionRef, newSession);
  } else {
    const data = sessionSnap.data() as ChatSession;
    await updateDoc(sessionRef, {
      lastMessage: text,
      updatedAt: now,
      unreadCount: sender === "client" ? data.unreadCount + 1 : 0,
      active: true
    });
  }
  
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
};

export const clearSessionUnread = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, "chat_sessions", sessionId);
  try {
    await updateDoc(sessionRef, { unreadCount: 0 });
  } catch (e) {
    console.warn("Unable to clear unread count:", e);
  }
};
