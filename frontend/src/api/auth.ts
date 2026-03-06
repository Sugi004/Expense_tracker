import api from "./axios";
import type { Token } from "../types/index";

export const register = async (email: string, password: string): Promise<Token> => {
    const response = await api.post("/auth/register", { email, password });
    return response.data;
}

export const login = async (email: string, password: string): Promise<Token> => {
    const response = await api.post<Token>("/auth/login", { email, password });
    return response.data;
}
