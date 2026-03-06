import api from "./axios";
import type { DashboardData } from "../types/index";


export const getDashboardSummary = async(): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/dashboard/summary");
    return response.data;
}
