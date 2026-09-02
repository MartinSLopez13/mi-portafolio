import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHZNqu1UU4GuoQhZaDy-v2-dy-hy_1ZIQ",
  authDomain: "santo-mate.firebaseapp.com",
  projectId: "santo-mate",
  storageBucket: "santo-mate.firebasestorage.app",
  messagingSenderId: "390893074530",
  appId: "1:390893074530:web:d7e9ac366ccb03950b793b"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);