import React, { createContext, useContext, useState, useEffect, ReactNode } from "react" ;
import { User } from "./types" ;

interface AuthContextType {
    user: User | null ;
    token: string | null ;
    isAuthenticated: boolean ;
    login: (userData: User, token: string) => void ;
    logout: () => void ;
    loading: boolean ;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined) ;

const KEYS = {
    user: "session_user",
    token: "session_token",
    expires: "session_expires_at",
} ;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null) ;
    const [token, setToken] = useState<string | null>(null) ;
    const [ expiresAt, setExpiresAt ] = useState<number | null>(null) ;
    const [loading, setLoading] = useState(true) ;

    const clearSession = () => {
        setUser(null) ;
        setToken(null) ;
        setExpiresAt(null) ;
        Object.values(KEYS).forEach((k) => localStorage.removeItem(k)) ;
    }

    console.log({
        dev: import.meta.env.DEV,
        autologin: import.meta.env.VITE_DEV_AUTOLOGIN,
        expires: import.meta.env.VITE_DEV_SESSION_EXPIRES,
        savedUser: localStorage.getItem("session_user"),
        });

    useEffect(() => {
        const savedUser = localStorage.getItem(KEYS.user) ;
        const savedToken = localStorage.getItem(KEYS.expires) ;
        const savedExpires = localStorage.getItem(KEYS.expires) ;

        if(savedUser && savedToken) {
            const exp = savedExpires ? Number(savedExpires) : null ;
            if(exp && Date.now() >= exp) {
                clearSession() ;
            } else {
                setUser(JSON.parse(savedUser)) ;
                setToken(savedToken) ;
                setExpiresAt(exp) ;
            }
        } else if(import.meta.env.DEV && import.meta.env.VITE_DEV_AUTOLOGIN === "true") {
            const exp = import.meta.env.VITE_DEV_SESSION_EXPIRES 
                ? new Date(import.meta.env.VITE_DEV_SESSION_EXPIRES).getTime()
                : Date.now() + 8 * 60 * 60 * 1000
            if(Date.now() < exp) {
                const devUser = { id: "999", name: "Juno", username: "martian"} as User ;
                setUser(devUser) ;
                setToken("juno-dev-token") ;
                setExpiresAt(exp) ;
                localStorage.setItem(KEYS.user, JSON.stringify(devUser)) ;
                localStorage.setItem(KEYS.token, "juno-dev-token") ;
                localStorage.setItem(KEYS.expires, String(exp)) ;
            }
        }
        setLoading(false) ;
    }, []);

    useEffect(() => {
        if (!expiresAt) return;

        const MAX_TIMEOUT = 2_147_483_647; 
        const ms = expiresAt - Date.now();

        if (ms <= 0) {
            clearSession();
            return;
        }
        if (ms > MAX_TIMEOUT) return; // too far out for a timer; expiry is still checked on page load

        const timer = setTimeout(clearSession, ms);
        return () => clearTimeout(timer);
        }, [expiresAt]);

    const login = (userData: User, userToken: string) => {
        setUser(userData) ;
        setToken(userToken) ;
        localStorage.setItem("session_user", JSON.stringify(userData)) ;
        localStorage.setItem("session_token", userToken) ;
    } ;

    const logout = () => {
        setUser(null) ;
        setToken(null) ;
        localStorage.removeItem("session_user") ;
        localStorage.removeItem("session_token") ;
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading}}>
            {!loading && children}
        </AuthContext.Provider>
    ) ;
} ;

export const useAuth = () => {
    const context = useContext(AuthContext) ;
    if(!context) {
        throw new Error("useAuth must be used within an AuthProvider") ;
    }
    return context ;
} ;