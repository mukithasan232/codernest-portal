export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole | string;
  freeCredits: number;
  createdAt: string | Date;
}

export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'converted' | 'closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  message?: string | null;
  budget?: string | null;
  status: LeadStatus | string;
  source?: string;
  serviceRequested?: string | null;
  createdAt?: string | Date;
}

export type ProjectType = 'web' | 'image-studio';
export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Milestone {
  title: string;
  percentComplete: number; // 0-100
  done: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  type: ProjectType | string;
  status: ProjectStatus | string;
  milestones: Milestone[];
  createdAt: string | Date;
  completedAt?: string | Date | null;
}

export type ImageTier = 'A-automated' | 'B-human';
export type ImageOrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImageOrder {
  id: string;
  clientId: string;
  clientEmail?: string | null;
  tier: ImageTier | string;
  status: ImageOrderStatus | string;
  originalUrl: string;
  processedUrl?: string | null;
  instructions?: string | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string; // Markdown
  imageUrl?: string | null;
  cover_image?: string | null;
  tags?: string[];
  published?: boolean;
  status?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  sector: ProjectType | string;
  clientName?: string | null;
  challenge: string;
  solution: string;
  results?: string | null;
  techStack: string[];
  imageUrl?: string | null;
  githubUrl?: string | null;
  liveDemoUrl?: string | null;
  featured: boolean;
  metaTitle?: string | null;
  metaDesc?: string | null;
  keywords?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface ServicePricing {
  id: string;
  name: string;
  sector: ProjectType | string;
  tier: 'starter' | 'pro' | 'enterprise' | string;
  price: number;
  priceLabel?: string | null;
  features: string[];
  ctaLabel: string;
  stripePriceId?: string | null;
  isPopular?: boolean;
  customHtml?: string | null;
  displayOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  text: string;
  createdAt: string | Date;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  clientId: string;
  clientEmail?: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus | string;
  dueDate?: string | Date | null;
  paymentMethod?: string | null;
  stripePaymentLink?: string | null;
  paypalLink?: string | null;
  escrowLink?: string | null;
  createdAt: string | Date;
  paidAt?: string | Date | null;
}

// ── Constants ───────────────────────────────────────────────────────────────
export const FREE_IMAGE_CREDIT_LIMIT = 5;

export interface Testimonial {
  id: string;
  client_name: string;
  designation_company?: string | null;
  review_text: string;
  rating: number; // 1-5
  avatar_url?: string | null;
  is_published: boolean;
  createdAt: string | Date;
}
