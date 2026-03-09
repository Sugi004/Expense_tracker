import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, token } = useAuth();
    console.log("ProtectedRoute render:", { isAuthenticated, token });


    if (!isAuthenticated) {
        console.log("Not Authenticated");
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
}

export default ProtectedRoute;
