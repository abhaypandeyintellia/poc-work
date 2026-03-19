
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import {db} from '../config';

const todosRef = collection(db, 'todos');

export async function addTodo(userId, title){
    if(title.trim() === '') throw new Error("Title required");

    return addDoc(todosRef, {
        title: title.trim(),
        completed: false,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}

// real-time todos
export function subscribeTodos(userId, callback){
    const q = query(
        todosRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap)=>{
        const todos = snap.docs.map(todo => ({
            id: todo.id,
            ...todo.data(),
        }));
        callback(todos);
    });
}


//read once todos
export async function getTodos(userId){
    const q = query(todosRef, where("userId", "==", userId));
    const snap = getDocs(q);
    return (await snap).docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

//update todos
export async function updateTodos(todoId, updates){
    return updateDoc(doc(db, "todos", todoId),{
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

//toggle comeplete
export async function toggleTodo(todoId, completed){
    return updateDoc(doc(db, "todos", todoId), {
        completed,
        updatedAt: serverTimestamp(),
    });
}

//delete todo
export async function deleteTodo(todoId){
    return deleteDoc(doc(db, "todos", todoId));
}