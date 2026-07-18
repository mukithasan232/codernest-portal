export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'CLIENT';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface Lead {
    id: number;
    name: string;
    email: string;
    message: string | null;
    budget?: string;
    status: 'new' | 'contacted' | 'proposal' | 'converted' | 'closed';
    created_at: string;
    createdAt?: string;
}

export interface Project {
    id: string;
    client_id: string | null;
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    price: number | null;
    deadline: string | null;
    created_at: string;
}

export interface Payment {
    id: string;
    project_id: string | null;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    stripe_session_id: string | null;
    created_at: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    image_url: string | null;
    author_id: string | null;
    created_at: string;
}

export interface Message {
    id: number;
    project_id: string;
    sender_id: string | null;
    message: string;
    created_at: string;
}

export interface Testimonial {
    id: string;
    client_name: string;
    designation_company: string | null;
    review_text: string;
    rating: number;
    avatar_url: string | null;
    is_published: boolean;
    created_at: string;
}
