import { auth } from "../config";

import { createUserWithEmailAndPassword,
         GoogleAuthProvider,
         signInWithEmailAndPassword,
         signInWithPopup,
         signOut
 } from "firebase/auth";

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.log(err.message);
    }
}

export const register = async (email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.log(err.message);
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (err) {
        console.log(err.message);
    }
}

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
    signInWithPopup(auth, googleProvider);
}