export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  readTime: string;
  imageUrl: string;
  publishedAt: string;
  featured?: boolean;
}

export interface Career {
  id: string;
  title: string;
  department: "Engineering" | "Design" | "Product" | "Sales" | "Marketing";
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Internship";
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  open: boolean;
}

export interface JobApplication {
  id: string;
  careerId: string;
  jobTitle: string;
  name: string;
  email: string;
  portfolioUrl?: string;
  githubUrl?: string;
  resumeText: string;
  appliedAt: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied" | "archived";
  responseSent?: string;
  emailLog?: string[];
  projectApproved?: boolean;
  projectStatus?: "progress" | "done";
}

export interface DeliverablesMessage {
  id: string;
  sender: "client" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileData?: string;
}

export interface ChatMessage {
  id: string;
  sender: "client" | "admin";
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  clientName: string;
  clientEmail?: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Android Development" | "Web Development" | "Pricing" | "Security";
}

export interface PageContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  aboutTitle: string;
  aboutContent: string;
  aboutStats: { label: string; value: string }[];
  stackTitle: string;
  stackSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

export interface ProjectDeliverable {
  id: string;
  clientEmail: string;
  uploadedBy: string; // Email of the uploader, or "client" / "admin"
  uploadedByName: string; // Display name of uploader
  fileName: string;
  fileSize: string; // e.g. "140 KB", "1.2 MB"
  fileType: string; // e.g. "PDF Document", "Figma Design Mockup", "Technical requirements", "ZIP Archive", "Image"
  uploadedAt: string; // ISO String
  description: string;
  fileData?: string; // base64 encoded data string or text contents
  downloadUrl?: string; // fallback mock or external link
}

export interface DeliverablesChatMetadata {
  id?: string;
  clientEmail: string;
  lastMessage: string;
  updatedAt: string;
  unreadCountAdmin: number;
  unreadCountClient: number;
}

