import { Blog, Career, FAQ, PageContent } from "../types";

export const DEFAULT_PAGE_CONTENT: PageContent = {
  id: "agency_config",
  heroTitle: "We Engineer High-Performance Web & Android Solutions",
  heroSubtitle: "Enterprise-grade cross-platform architectures, secure cloud backends, and bespoke digital portals designed for industry leaders and fast-growing enterprises.",
  heroCTA: "Consult Our Engineers",
  aboutTitle: "Elite Tech Engineering Firm",
  aboutContent: "We specialize in building cutting-edge Android applications and highly scalable React web applications. Utilizing modern cloud architectures, secure backend integrations, and meticulous UI/UX principles, we help leading businesses automate workflows and deliver pristine user experiences. Our team is driven by two senior software engineers, Somil Srivastav and Vaibhav Keshari, bringing enterprise-grade craftsmanship to every project.",
  aboutStats: [
    { label: "Active Deployments", value: "24+" },
    { label: "Android Apps Active", value: "10+" },
    { label: "Client Retainers", value: "98%" },
    { label: "Server Uptime Guarantee", value: "99.99%" }
  ],
  stackTitle: "Our Technical Core",
  stackSubtitle: "We use robust, future-proof technologies to maximize performance, fluid responsiveness, and ironclad security.",
  contactEmail: "somilsrivastav18@gmail.com",
  contactPhone: "+91 91404 43015",
  contactAddress: "Engineering Hub, Lucknow, UP, India"
};

export const DEFAULT_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Architecting High-Throughput Cloud Backends with React & Serverless",
    slug: "architecting-high-throughput-cloud-backends",
    summary: "How we implemented low-latency serverless workers and Firestore synchronization to support thousands of concurrent users in FinTrack Pro.",
    content: `
### The Challenge of Modern Real-Time FinTech

Building state-of-the-art financial tracking apps like **FinTrack Pro** requires not just reactive user interfaces, but ultra-secure, scalable, and responsive database layers. 

In this architectural overview, we dissect how our engineering team optimized data synchronization between React client-side states and Cloud Serverless Workers.

#### 1. Real-Time Distributed Architecture
We leveraged Cloudflare Workers to handle light-weight, high-speed API routing to achieve less than **50ms** global latency:
- **Client Side:** React with Vite & Tailwind CSS.
- **Data Cache:** Persistent browser cache matching state variables.
- **Serverless Compute:** Edge compute worker serving endpoints securely.

#### 2. Key Optimization Strategies
- **Batch Updates:** Consolidating database transactions to reduce writes.
- **Optimistic UI:** Applying UI changes instantly before server confirmation.
- **Strict Content Validation:** Ensuring cryptographic validation on all inbound financial payloads.

This combination guarantees an enterprise-grade experience where data remains integrated and secure, even in volatile network environments.
    `,
    author: "Somil Srivastav",
    authorRole: "Principal Web Architect",
    category: "Cloud Engineering",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
    publishedAt: "2026-06-20",
    featured: true
  },
  {
    id: "blog-2",
    title: "Optimizing Android Apps for Low-Resource Environments",
    slug: "optimizing-android-apps-low-resource",
    summary: "How our deep optimization methodologies on Google Play Store listings achieved a 40% reduction in app size and 2.5x faster start times.",
    content: `
### Android Engineering at Scale

Developing for Android means writing code that runs on thousands of different device configurations. In our work with clients like **AK Industries**, we encountered the critical need to optimize for varying RAM sizes, network limitations, and hardware configurations.

#### The Performance Blueprint

To achieve the fluid, fluid responsiveness expected of modern industrial applications, we implemented a multi-tiered optimization plan:

1. **State Reduction:** Migrating heavy client calculations into pre-compiled asynchronous modules.
2. **Asset Compaction:** Transitioning all vector drawables to modern format protocols.
3. **Database Caching:** Designing high-reliability offline-first persistence engines.

#### Play Store Success
By restructuring the package architecture, the **AK Industries Android application** reached lightning-fast cold-start times, significantly boosting retention and rating performance on the Google Play Store.
    `,
    author: "Vaibhav Keshari",
    authorRole: "Lead Android Engineer",
    category: "Mobile Systems",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    publishedAt: "2026-06-15",
    featured: false
  },
  {
    id: "blog-3",
    title: "Designing Seamless Portal Solutions for State Infrastructure",
    slug: "designing-railway-training-portal",
    summary: "A deep dive into the design and security implementation of the Northern Railways Training Portal, serving hundreds of government trainees daily.",
    content: `
### Secure Enterprise Portals

Government and infrastructure projects require robust security clearances, fail-safe backups, and intuitive workflows for personnel with varying degrees of technical fluency. 

Our work on the **Northern Railways Training Portal** serves as an industry standard for secure government portal systems.

#### Core Pillars of the Northern Railways Architecture

- **Symmetric Role-Based Access (RBAC):** Strict security clearances separating administrators, instructors, and trainees.
- **Zero-Trust Network Model:** High-security session tracking with instantaneous revocation capabilities.
- **Offline Trainee Support:** Local offline-first modules ensuring trainee assessments are saved in low-signal rail zones.

By implementing React components and utilizing tailwind styling, we engineered a fast, compliant, and universally accessible solution.
    `,
    author: "Somil Srivastav",
    authorRole: "Principal Architect",
    category: "Enterprise Security",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
    publishedAt: "2026-06-10",
    featured: false
  }
];

export const DEFAULT_CAREERS: Career[] = [
  {
    id: "job-1",
    title: "Senior React Web Engineer",
    department: "Engineering",
    location: "Remote / Lucknow, India",
    type: "Full-Time",
    experience: "4+ Years",
    salary: "₹12L - ₹18L / annum",
    description: "We are looking for a Senior React Engineer who is passionate about creating high-performance, responsive single-page applications. You will collaborate closely with Somil Srivastav and Vaibhav Keshari to engineer client portals, real-time dashboards, and secure backend integrations.",
    requirements: [
      "Extensive experience with React 18/19, TypeScript, and modern bundlers (Vite/Webpack).",
      "Proficiency in responsive interface design using Tailwind CSS.",
      "Experience with state management libraries and real-time database syncing (Firestore, WebSockets).",
      "Demonstrated history of optimizing load times and client-side performance."
    ],
    benefits: [
      "Flexible working hours and 100% remote working option.",
      "Annual technical learning and conference stipend.",
      "Comprehensive medical coverage.",
      "Performance-based project bonuses."
    ],
    open: true
  },
  {
    id: "job-2",
    title: "Lead Android Application Developer",
    department: "Engineering",
    location: "Remote / Lucknow, India",
    type: "Full-Time",
    experience: "3+ Years",
    salary: "₹10L - ₹16L / annum",
    description: "Join our mobile team to construct pristine native Android applications for industrial clients like AK Industries. You will direct mobile app lifecycles, publish to the Google Play Store, and build low-latency interfaces.",
    requirements: [
      "Expert knowledge of Android Studio, Kotlin, Jetpack Compose, and material design.",
      "Strong understanding of cross-platform optimizations and local databases (Room/SQLite).",
      "Proven history of deploying and maintaining apps on the Google Play Store.",
      "Familiarity with secure backend APIs, JWT authentications, and FCM push notifications."
    ],
    benefits: [
      "Latest workstation hardware provided (M3 MacBook Pro or equivalent Dell XPS).",
      "Quarterly wellness allowances.",
      "Generous paid-time-off and parental leaves.",
      "Direct mentorship from senior technical leads."
    ],
    open: true
  },
  {
    id: "job-3",
    title: "Product Designer (UI/UX)",
    department: "Design",
    location: "Hybrid / Lucknow, India",
    type: "Contract",
    experience: "2+ Years",
    salary: "₹6L - ₹9L / annum",
    description: "Design high-fidelity mockups, client branding assets, and wireframe prototypes. Create stunning interfaces that align with our signature elite enterprise aesthetic.",
    requirements: [
      "Robust portfolio showcasing complex web portals or native Android apps.",
      "Mastery of Figma, including advanced prototyping, auto-layouts, and design systems.",
      "Basic understanding of Tailwind CSS class naming to collaborate smoothly with developers.",
      "Ability to conduct user testing and translate feedback into pristine layouts."
    ],
    benefits: [
      "Creative freedom on exciting FinTech, industrial, and infrastructure portals.",
      "Access to premium UI assets and Figma subscriptions.",
      "Flexible schedule with occasional face-to-face brainstorming.",
      "Strong pathway to full-time transition."
    ],
    open: true
  }
];

export const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "What is your main technology stack?",
    answer: "Our primary core stack centers on React and TypeScript for modular, high-performance web applications, and Kotlin/Jetpack Compose for native, high-performance Android apps. We leverage secure serverless backends and cloud services like Firestore, Cloud SQL, and Cloudflare Workers to guarantee bulletproof security and scaling.",
    category: "General"
  },
  {
    id: "faq-2",
    question: "Do you publish our application directly to the Google Play Store?",
    answer: "Yes. We manage the entire deployment lifecycle, including preparing production-ready App Bundles (.aab), compiling privacy documents, configuring store listing descriptions/graphics, and navigating Google's strict verification guidelines. We have successfully published and supported applications like AK Industries on the Play Store.",
    category: "Android Development"
  },
  {
    id: "faq-3",
    question: "How do you ensure data security in web and client portals?",
    answer: "We implement zero-trust role-based access controls, JWT or Firebase secure authentication, and end-to-end data encryption. Every portal we construct, including the Northern Railways Training Portal, undergoes strict automated vulnerability checks prior to release.",
    category: "Security"
  },
  {
    id: "faq-4",
    question: "What is your typical project delivery timeline?",
    answer: "An enterprise-grade responsive website is generally engineered and deployed in 3 to 5 weeks. Complex custom portal systems and high-end Android apps require approximately 6 to 10 weeks of development, which includes rigid pre-production QA testing.",
    category: "Pricing"
  },
  {
    id: "faq-5",
    question: "Do you offer post-launch maintenance and updates?",
    answer: "Absolutely. We offer SLA-backed technical maintenance packages that include real-time server monitoring, monthly OS compatibility reviews, database indexing optimization, and instant bug resolution.",
    category: "General"
  }
];

export const CLIENT_PORTFOLIOS = [
  {
    name: "AK Industries",
    type: "Industrial IoT & Mobile App Client",
    url: "https://akindustrieslko.in/",
    portalUrl: "https://portal.akindustrieslko.in/",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.akindustries.app",
    desc: "A prominent industrial solutions manufacturer. We engineered their unified enterprise customer portal and native Android application, enabling automated order tracking and live equipment monitoring.",
    logoLetter: "A"
  },
  {
    name: "Pulse Rank",
    type: "Digital SEO & Growth Engine Project",
    url: "https://pulserank.in/",
    desc: "A cutting-edge data dashboard providing real-time ranking telemetry, custom SEO audits, and content index monitoring for high-volume enterprise websites.",
    logoLetter: "P"
  },
  {
    name: "FinTrack Pro",
    type: "Sleek FinTech Platform Project",
    url: "https://fintrackproapp.netlify.app/",
    workersUrl: "https://finanacetracker.somilsrivastav18.workers.dev/",
    desc: "A high-fidelity wealth tracker app featuring instant ledger updates and secure cloudflare backend compute pipelines. Play Store publication is currently pending.",
    logoLetter: "F"
  },
  {
    name: "Northern Railways Training Portal",
    type: "Government Infrastructure Project",
    url: "https://northernrailwaystrainingportal.netlify.app/",
    desc: "A secure, role-based education hub serving trainee registrations, course progress reporting, and automated certification generators for the northern railway network.",
    logoLetter: "N"
  }
];

export const CORE_TEAM = [
  {
    name: "Somil Srivastav",
    role: "Co-Founder & Principal Web Architect",
    portfolioUrl: "https://somilsrivastav.netlify.app/",
    avatar: "SS",
    bio: "Passionate about high-throughput web systems, custom API design, and pristine responsive dashboards in React and Cloud Native ecosystems."
  },
  {
    name: "Vaibhav Keshari",
    role: "Co-Founder & Lead Android Architect",
    portfolioUrl: "https://vaibhavikeshari.netlify.app/",
    avatar: "VK",
    bio: "Expert in Kotlin performance tuning, offline-first mobile databases, Jetpack Compose layouts, and seamless Google Play Store submission processes."
  }
];
