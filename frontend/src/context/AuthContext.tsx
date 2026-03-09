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
    const [authToken, setAuthToken] = useState<string | null>(sessionStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saveToken = sessionStorage.getItem("token");
        console.log("Token from saveToken: ", saveToken);
        if (saveToken) {
            setAuthToken(saveToken);
        }
        setIsLoading(false);
    }, [])

    const login = (newToken: string) => {
        sessionStorage.setItem("token", newToken);
        console.log("Token from authcontext: ", newToken);
        setAuthToken(newToken);
    }

    const logout = () => {
        sessionStorage.removeItem("token");
        setAuthToken(null);
    }

    return (
        <AuthContext.Provider value={{ token: authToken, setToken: setAuthToken, isAuthenticated: !!authToken, isLoading, logout, login }}>
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
