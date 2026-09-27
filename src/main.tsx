import { AuthProvider } from "./utils/AuthContext" ;
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import AppRoutes from "./App.tsx";
import "./style.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </StrictMode>
);