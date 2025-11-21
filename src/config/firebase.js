import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "dreamchat-5b840.firebaseapp.com",
  projectId: "dreamchat-5b840",
  storageBucket: "dreamchat-5b840.firebasestorage.app",
  messagingSenderId: "737419729548",
  appId: "1:737419729548:web:b41a173ae9c1be421379a9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;