import api from "./axios";
import type { Category } from "../types/index";

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories/");
    return response.data;
}

export const createCategory = async (name: string): Promise<Category> => {
    const response = await api.post<Category>("/categories/", { name });
    return response.data;
}

export const updateCategory = async (id: number, name: string): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, { name });
    return response.data;
}

export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
}

