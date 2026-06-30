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
  increment,
  where
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Blog, Career, FAQ, PageContent, Inquiry, JobApplication, ChatMessage, ChatSession, ProjectDeliverable, DeliverablesMessage, DeliverablesChatMetadata } from "../types";
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

export const getInquiries = async (email?: string): Promise<Inquiry[]> => {
  try {
    const inquiriesCol = collection(db, "inquiries");
    let q;
    if (email) {
      q = query(inquiriesCol, where("email", "==", email));
    } else {
      q = query(inquiriesCol, orderBy("createdAt", "desc"));
    }
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data() as Inquiry);
    if (email) {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return results;
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

export const getJobApplications = async (email?: string): Promise<JobApplication[]> => {
  try {
    const appsCol = collection(db, "applications");
    let q;
    if (email) {
      q = query(appsCol, where("email", "==", email));
    } else {
      q = query(appsCol, orderBy("appliedAt", "desc"));
    }
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data() as JobApplication);
    if (email) {
      results.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }
    return results;
  } catch (err) {
    return handleFirebaseError(err, []);
  }
};

export const updateApplicationStatus = async (id: string, status: JobApplication["status"]): Promise<void> => {
  const appRef = doc(db, "applications", id);
  await updateDoc(appRef, { status });
};

// --- REAL-TIME LIVE CHAT ---
export const listenToSessions = (callback: (sessions: ChatSession[]) => void, email?: string) => {
  const sessionsCol = collection(db, "chat_sessions");
  let q;
  if (email) {
    q = query(sessionsCol, where("clientEmail", "==", email));
  } else {
    q = query(sessionsCol, orderBy("updatedAt", "desc"));
  }
  
  return onSnapshot(q, (snapshot) => {
    const sessions: ChatSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as ChatSession);
    });
    if (email) {
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
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

// --- PROJECT DELIVERABLES / SECURE DOCUMENT MANAGEMENT ---
const DEFAULT_DELIVERABLES: ProjectDeliverable[] = [
  {
    id: "del-1",
    clientEmail: "somilsrivastav18@gmail.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "Somil Srivastava (Client)",
    fileName: "Initial_App_Requirements_V1.txt",
    fileSize: "1.2 KB",
    fileType: "text/plain",
    uploadedAt: "2026-06-25T10:30:00.000Z",
    description: "Initial user stories and layout sketches for the client dashboard and CMS requirements.",
    fileData: "data:text/plain;base64,MS4gVXNlciBMb2dpbiBhbmQgQXV0aGVudGljYXRpb24uCjIuIENsaWVudCBQb3J0YWwgdG8gbWFuYWdlIGRvY3VtZW50cyBhbmQgZGVsaXZlcmFibGVzLgozLiBSZWFsLXRpbWUgY2hhdCB3aXRoIFRTIHN1cHBvcnQuCjQuIER5bmFtaWMgQ01TIGZvciBsYW5kaW5nIHBhZ2Uu"
  },
  {
    id: "del-2",
    clientEmail: "somilsrivastav18@gmail.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "Somil Srivastava (Client)",
    fileName: "Company_Logo_HighRes.png",
    fileSize: "4.8 KB",
    fileType: "image/png",
    uploadedAt: "2026-06-26T14:20:00.000Z",
    description: "Vector logo assets for the customized customer branding.",
    fileData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED5SGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPR7SAAAADhJREFUKFNjYGD4z4AEMDEgA0Y0AXgCI0gCwxA8AsgSDEl0CYg6uASYJTBJmDpkh7PQQb6DuQAmBgYAMpIF7bO9vF0AAAAASUVORK5CYII="
  },
  {
    id: "del-3",
    clientEmail: "somilsrivastav18@gmail.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "Somil Srivastava (Client)",
    fileName: "UI_Design_Concept_Feedback.txt",
    fileSize: "512 B",
    fileType: "text/plain",
    uploadedAt: "2026-06-28T09:15:00.000Z",
    description: "Brief notes regarding the initial color schemes and font preferences.",
    fileData: "data:text/plain;base64,UGxlYXNlIHVzZSBhIGNsZWFuLCBoaWdoLWNvbnRyYXN0IHNsYXRlLXRlbXBsYXRlIGZvciB0aGUgY2xpZW50IHBvcnRhbC4="
  },
  {
    id: "del-4",
    clientEmail: "somilsrivastav18@gmail.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "somilsrivastav18@gmail.com",
    fileName: "Technical_Specifications_Draft_V1.pdf",
    fileSize: "15.4 KB",
    fileType: "application/pdf",
    uploadedAt: "2026-06-29T16:45:00.000Z",
    description: "Detailed system requirements, database schema design, and production deployment pipeline description.",
    fileData: "data:application/pdf;base64,JVBERi0xLjQKJVRTIERlbGl2ZXJhYmxlIFRlY2huaWNhbCBTcGVjaWZpY2F0aW9uCjEgMCBvYmoKPDwKICAvVGl0bGUgKFRTREMgRGVsaXZlcmFibGUpCiAgL0F1dGhvciAoVFNERSBFbmdpbmVlcmluZyBUZWFtKQo+PgplbmRvYmo="
  },
  {
    id: "del-5",
    clientEmail: "somilsrivastav18@gmail.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "somilsrivastav18@gmail.com",
    fileName: "Figma_Design_Wireframes_Export.zip",
    fileSize: "2.5 KB",
    fileType: "application/zip",
    uploadedAt: "2026-06-30T03:00:00.000Z",
    description: "Zipped layout design exports mapping user flows and key interactive touchpoints.",
    fileData: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=="
  },
  {
    id: "del-6",
    clientEmail: "client@company.com",
    uploadedBy: "somilsrivastav18@gmail.com",
    uploadedByName: "somilsrivastav18@gmail.com",
    fileName: "Figma_ECommerce_Mockups_V1.png",
    fileSize: "4.8 KB",
    fileType: "image/png",
    uploadedAt: "2026-06-29T11:00:00.000Z",
    description: "Initial home page and checkout layout mocks for client review.",
    fileData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED5SGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPR7SAAAADhJREFUKFNjYGD4z4AEMDEgA0Y0AXgCI0gCwxA8AsgSDEl0CYg6uASYJTBJmDpkh7PQQb6DuQAmBgYAMpIF7bO9vF0AAAAASUVORK5CYII="
  }
];

// --- FIRESTORE SECURE ERROR HANDLER ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestorePermissionError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const getDeliverables = async (emailFilter?: string): Promise<ProjectDeliverable[]> => {
  try {
    const deliverablesCol = collection(db, "deliverables");
    let querySnapshot;
    
    if (emailFilter) {
      const q = query(deliverablesCol, where("clientEmail", "==", emailFilter.toLowerCase()));
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(deliverablesCol);
    }
    
    let list: ProjectDeliverable[] = [];
    if (querySnapshot.empty && !emailFilter) {
      // Auto-seed deliverables
      for (const del of DEFAULT_DELIVERABLES) {
        await setDoc(doc(db, "deliverables", del.id), del);
      }
      list = [...DEFAULT_DELIVERABLES];
    } else {
      list = querySnapshot.docs.map(doc => doc.data() as ProjectDeliverable);
    }

    // Sort by uploadedAt desc
    list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return list;
  } catch (err: any) {
    if (err && (err.code === "permission-denied" || (err.message && err.message.includes("permission")))) {
      handleFirestorePermissionError(err, OperationType.GET, "deliverables");
    }
    return handleFirebaseError(err, DEFAULT_DELIVERABLES.filter(d => !emailFilter || d.clientEmail.toLowerCase() === emailFilter.toLowerCase()));
  }
};

export const saveDeliverable = async (deliverable: ProjectDeliverable): Promise<void> => {
  try {
    await setDoc(doc(db, "deliverables", deliverable.id), deliverable);
  } catch (err: any) {
    if (err && (err.code === "permission-denied" || (err.message && err.message.includes("permission")))) {
      handleFirestorePermissionError(err, OperationType.WRITE, `deliverables/${deliverable.id}`);
    }
    throw err;
  }
};

export const deleteDeliverable = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "deliverables", id));
  } catch (err: any) {
    if (err && (err.code === "permission-denied" || (err.message && err.message.includes("permission")))) {
      handleFirestorePermissionError(err, OperationType.DELETE, `deliverables/${id}`);
    }
    throw err;
  }
};

// --- PROJECT DELIVERABLES CHAT WITH SECURE FILE UPLOADS ---
export const listenToDeliverablesMessages = (
  clientEmail: string,
  callback: (messages: DeliverablesMessage[]) => void
) => {
  const emailKey = clientEmail.toLowerCase().trim();
  const messagesCol = collection(db, "deliverables_chats", emailKey, "messages");
  const q = query(messagesCol, orderBy("timestamp", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: DeliverablesMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data() as DeliverablesMessage);
      });
      callback(messages);
    },
    (err) => {
      console.error("Error listening to deliverables chat messages:", err);
    }
  );
};

export const sendDeliverablesMessage = async (
  clientEmail: string,
  sender: "client" | "admin",
  senderName: string,
  text: string,
  fileAttachment?: { name: string; size: string; type: string; base64: string } | null
): Promise<void> => {
  const emailKey = clientEmail.toLowerCase().trim();
  const messageId = `delmsg-${Date.now()}`;
  const messageRef = doc(db, "deliverables_chats", emailKey, "messages", messageId);

  const now = new Date().toISOString();
  const message: DeliverablesMessage = {
    id: messageId,
    sender,
    senderName,
    text,
    timestamp: now,
  };

  if (fileAttachment) {
    message.fileName = fileAttachment.name;
    message.fileSize = fileAttachment.size;
    message.fileType = fileAttachment.type;
    message.fileData = fileAttachment.base64;

    // Auto-create a permanent ProjectDeliverable file so it also populates the file archives!
    try {
      const newDeliverable: ProjectDeliverable = {
        id: `del-chatfile-${Date.now()}`,
        clientEmail: emailKey,
        uploadedBy: sender === "client" ? emailKey : "admin",
        uploadedByName: senderName,
        fileName: fileAttachment.name,
        fileSize: fileAttachment.size,
        fileType: fileAttachment.type,
        uploadedAt: now,
        description: `Shared via secure deliverables chat: "${text || "No message description provided."}"`,
        fileData: fileAttachment.base64,
      };
      await saveDeliverable(newDeliverable);
    } catch (err) {
      console.error("Failed to auto-save chat file attachment to deliverables list:", err);
    }
  }

  await setDoc(messageRef, message);

  // Update parent metadata document for tracking lastMessage and unread counts
  try {
    const chatRef = doc(db, "deliverables_chats", emailKey);
    const metadataUpdate = {
      clientEmail: emailKey,
      lastMessage: text || (fileAttachment ? `Attached: ${fileAttachment.name}` : "Shared a file"),
      updatedAt: now,
      unreadCountAdmin: sender === "client" ? increment(1) : 0,
      unreadCountClient: sender === "admin" ? increment(1) : 0,
    };
    await setDoc(chatRef, metadataUpdate, { merge: true });
  } catch (err) {
    console.error("Failed to update deliverables chat metadata:", err);
  }
};

// --- PROJECT DELIVERABLES CHATS META LISTENERS ---
export const listenToDeliverablesChats = (
  callback: (chats: DeliverablesChatMetadata[]) => void
): (() => void) => {
  const chatsCol = collection(db, "deliverables_chats");
  return onSnapshot(
    chatsCol,
    (snapshot) => {
      const chats: DeliverablesChatMetadata[] = [];
      snapshot.forEach((docSnap) => {
        chats.push({ id: docSnap.id, ...docSnap.data() } as DeliverablesChatMetadata);
      });
      callback(chats);
    },
    (err) => {
      console.error("Error listening to deliverables chats metadata:", err);
    }
  );
};

export const listenToSingleDeliverablesChat = (
  clientEmail: string,
  callback: (chat: DeliverablesChatMetadata | null) => void
): (() => void) => {
  const emailKey = clientEmail.toLowerCase().trim();
  const chatRef = doc(db, "deliverables_chats", emailKey);
  return onSnapshot(
    chatRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as DeliverablesChatMetadata);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error("Error listening to single deliverables chat metadata:", err);
    }
  );
};

export const clearDeliverablesUnread = async (
  clientEmail: string,
  role: "admin" | "client"
): Promise<void> => {
  const emailKey = clientEmail.toLowerCase().trim();
  const chatRef = doc(db, "deliverables_chats", emailKey);
  try {
    if (role === "admin") {
      await setDoc(chatRef, { unreadCountAdmin: 0 }, { merge: true });
    } else {
      await setDoc(chatRef, { unreadCountClient: 0 }, { merge: true });
    }
  } catch (err) {
    console.warn("Unable to clear deliverables unread count:", err);
  }
};

// --- PROJECT APPROVAL LOGIC ---
export const approveInquiryProject = async (inquiryId: string, approved: boolean): Promise<void> => {
  const inquiryRef = doc(db, "inquiries", inquiryId);
  await updateDoc(inquiryRef, { projectApproved: approved });
};

export const updateProjectStatus = async (inquiryId: string, status: "progress" | "done"): Promise<void> => {
  const inquiryRef = doc(db, "inquiries", inquiryId);
  await updateDoc(inquiryRef, { projectStatus: status });
};

export const checkProjectApproval = async (email: string): Promise<boolean> => {
  try {
    const inquiriesCol = collection(db, "inquiries");
    const q = query(inquiriesCol, where("email", "==", email.toLowerCase().trim()));
    const snapshot = await getDocs(q);
    
    let isApproved = false;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.projectApproved === true) {
        isApproved = true;
      }
    });
    return isApproved;
  } catch (err) {
    console.error("Error checking project approval status:", err);
    return false;
  }
};


