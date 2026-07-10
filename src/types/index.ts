export type UserRole = 'admin' | 'super_admin' | 'client';

export interface User {
  id: string;  // UUID from Supabase Auth
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  /** Number of free image processing credits used (max 5) */
  freeCreditsUsed: number;
  createdAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'converted' | 'closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  budget?: string;
  status: LeadStatus;
  created_at: string;
  createdAt?: string;
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
  type: ProjectType;
  status: ProjectStatus;
  milestones: Milestone[];
  createdAt: string;
  completedAt?: string;
}

export type ImageTier = 'A-automated' | 'B-human';
export type ImageOrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImageOrder {
  id: string;
  clientId: string;
  clientEmail?: string;
  tier: ImageTier;
  status: ImageOrderStatus;
  originalUrl: string;
  processedUrl?: string;
  instructions?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // Markdown
  imageUrl?: string;
  tags?: string[];
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  sector: ProjectType;
  clientName?: string;
  challenge: string;
  solution: string;
  results?: string;
  techStack: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServicePricing {
  id: string;
  name: string;
  sector: ProjectType;
  tier: 'starter' | 'pro' | 'enterprise';
  price: number;
  priceLabel?: string;
  features: string[];
  ctaLabel: string;
  stripePriceId?: string;
  isPopular?: boolean;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  clientId: string;
  clientEmail?: string;
  amount: number; // in cents or dollars, standardizing on dollars for now
  currency: string;
  status: InvoiceStatus;
  dueDate?: string;
  paymentMethod?: string;
  stripePaymentLink?: string;
  paypalLink?: string;
  escrowLink?: string;
  createdAt: string;
  paidAt?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────
export const FREE_IMAGE_CREDIT_LIMIT = 5;

export interface Testimonial {
  id: string;
  client_name: string;
  designation_company?: string;
  review_text: string;
  rating: number; // 1-5
  avatar_url?: string;
  is_published: boolean;
  created_at: string;
}
