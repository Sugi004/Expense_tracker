export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    profile_picture?: string;
}

export interface UserUpdate{
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    profile_picture?: string;
}
export interface Token{
    access_token: string;
    token_type: string;
    
}
export interface Expense {
    id: string;
    title: string;
    amount: number;
    date: string;
    created_at: string;
    category_id: number;
    note?: string;
}

export interface Category {
    id: string;
    name: string;
    user_id: number | null;
}

export interface Budget {
    id: string;
    amount: number;
    category_id: number;
    year: number;
    month: number;
}

export interface CategorySummary {
    category: string;
    spent: number;
    budget?: number;
}

export interface DashboardData {
    total_spent: number;
    recent_expenses: Expense[];
    category_summary: CategorySummary[];
}

