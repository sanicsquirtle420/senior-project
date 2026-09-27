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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null) ;
    const [token, setToken] = useState<string | null>(null) ;
    const [loading, setLoading] = useState(true) ;

    useEffect(() => {
        const savedUser = localStorage.getItem("session_user") ;
        const savedToken = localStorage.getItem("session_token") ;

        if(savedUser && savedToken) {
            setUser(JSON.parse(savedUser)) ;
            setToken(savedToken) ;
        }
        setLoading(false) ;
    }, []);

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