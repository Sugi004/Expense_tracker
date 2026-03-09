import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    login: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(sessionStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saveToken = sessionStorage.getItem("token");
        if (saveToken) {
            setToken(saveToken);
        }
        setIsLoading(false);
    }, [])

    const login = (newToken: string) => {
        sessionStorage.setItem("token", newToken);
        setToken(newToken);
    }

    const logout = () => {
        sessionStorage.removeItem("token");
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, setToken, isAuthenticated: !!token, isLoading, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
