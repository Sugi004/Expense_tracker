import api from "./axios";
import type { UserResponse, UserUpdate } from "../types/index";

export const getProfile = async (): Promise<UserResponse> => {
    const response = await api.get("/users/me");
    return response.data;
}

export const updateProfile = async (data: UserUpdate): Promise<UserResponse> => {
    const response = await api.put("/users/me", data);
    return response.data;
}

export const deleteAccount = async (password: string): Promise<UserResponse> => {
    const response = await api.delete("/users/me", { data: { password } });
    return response.data;
}

export const uploadProfilePicture = async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UserResponse>("/users/me/profile-picture", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const changePassword = async (current_password: string, new_password: string): Promise<void> => {
     await api.put("/users/me/change-password", { current_password, new_password });
}

export const exportExpenses = async(): Promise<void> => {
    const response = await api.get("/users/me/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
