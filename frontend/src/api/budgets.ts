import api from "./axios";
import type { Budget } from "../types/index";

export const getBudgets = async(month?:number, year?:number): Promise<Budget[]> => {
    const response = await api.get<Budget[]>("/budgets/", { params: { month, year } });
    return response.data;
}

export const createBudget = async(data: Omit<Budget, "id">): Promise<Budget> => {
    const response = await api.post<Budget>("/budgets/", data);
    return response.data;
}

export const updateBudget = async(id: number, data: Partial<Budget>): Promise<Budget> => {
    const response = await api.put<Budget>(`/budgets/${id}`, data);
    return response.data;
}

export const deleteBudget = async(id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
}