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
    const [authToken, setAuthToken] = useState<string | null>(() => {
        return sessionStorage.getItem("token")
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const saveToken = sessionStorage.getItem("token");
        if (saveToken) {
            setAuthToken(saveToken);
        }
        setIsLoading(false);
    }, [])

    const login = (newToken: string) => {
        sessionStorage.setItem("token", newToken);
        setAuthToken(newToken);
    }

    const logout = () => {
        sessionStorage.removeItem("token");
        setAuthToken(null);
    }

    return (
        <AuthContext.Provider value={{ token: authToken, setToken: setAuthToken, isAuthenticated: !!authToken, isLoading: isLoading, logout, login }}>
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
