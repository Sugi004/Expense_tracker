import api from "./axios";
import type { Expense } from "../types/index";

export const getExpenses = async(month?:number, year?:number, category_id?:number): Promise<Expense[]> => {
    const response = await api.get<Expense[]>("/expenses/", { params: { month, year, category_id } });
    return response.data;
} 

export const createExpense = async(expense: Omit<Expense, "id" | "created_at">): Promise<Expense> => {
    const response = await api.post<Expense>("/expenses/", expense);
    return response.data;
}

export const updateExpense = async(id: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
}

export const deleteExpense = async(id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
}