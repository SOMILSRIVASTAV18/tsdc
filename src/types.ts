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
