// TypeScript interfaces for Nobti Admin Dashboard

export interface Category {
    id: string;
    name: string;
    name_ar: string;
    icon: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface Place {
    id: string;
    name: string;
    city: string;
    category_id: string;
    category?: Category;
    address: string | null;
    is_active: boolean;
    avg_wait_minutes: number;
    report_count: number;
    last_report_at: string | null;
    confidence_score: number;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: string;
    place_id: string;
    place?: Place;
    arrival_time: string;
    served_time: string | null;
    wait_minutes: number;
    source_hash: string;
    is_flagged: boolean;
    is_verified: boolean;
    created_at: string;
}

export interface Admin {
    id: string;
    user_id: string;
    role: 'admin' | 'superadmin';
    created_at: string;
}

export interface User {
    id: string;
    email: string;
}

// Form types
export interface CategoryFormData {
    name: string;
    name_ar: string;
    icon?: string;
    is_active: boolean;
    display_order: number;
}

export interface PlaceFormData {
    name: string;
    city: string;
    category_id: string;
    address?: string;
    is_active: boolean;
}

// Stats types
export interface PlaceStats {
    place_id: string;
    place_name: string;
    category_name: string;
    avg_wait_minutes: number;
    report_count: number;
    confidence_score: number;
    verified_count: number;
}
