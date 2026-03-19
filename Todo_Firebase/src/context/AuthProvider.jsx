import { createContext, useContext, useEffect, useState } from "react";
import { login, loginWithGoogle, logout, register } from "../services/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config";
import firebase from "firebase/compat/app";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(()=>{
        return onAuthStateChanged(auth, (firebaseUser)=>{
            setUser(firebaseUser);
            setLoading(false);

        });
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        loginWithGoogle
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )

}

export function useAuthcontext(){
    const ctx = useContext(AuthContext);

    if(!ctx){
        throw new Error("useAuthContext must be used inside AuthProvider");
    }

    return ctx;
}