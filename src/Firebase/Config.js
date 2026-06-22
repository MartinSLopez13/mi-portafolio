import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyBMdTZm6sToiAht9u_zwFVd3FoJGZAIA-w",
  authDomain: "papelera-baires.firebaseapp.com",
  projectId: "papelera-baires",
  storageBucket: "papelera-baires.firebasestorage.app",
  messagingSenderId: "725141248801",
  appId: "1:725141248801:web:3c5aa9918e2723f2ae7c60",
  measurementId: "G-35J1LXE3XQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 
export const auth = getAuth(app); 