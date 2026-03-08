import api from "./axios";
import type { Token } from "../types/index";

export const register = async (email: string, password: string, full_name?:string, phone_number?:string, date_of_birth?:string, profile_picture?:string): Promise<Token> => {
    const response = await api.post("/auth/register", { email, password, full_name, phone_number, date_of_birth, profile_picture });
    return response.data;
}

export const login = async (email: string, password: string): Promise<Token> => {
    const response = await api.post<Token>("/auth/login", { email, password });
    return response.data;
}
