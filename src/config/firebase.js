import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbZ028m8lsETQFgOo4g-IYYGz3fkl6NtI",
  authDomain: "dreamchat-5b840.firebaseapp.com",
  projectId: "dreamchat-5b840",
  storageBucket: "dreamchat-5b840.firebasestorage.app",
  messagingSenderId: "737419729548",
  appId: "1:737419729548:web:977974c37bee2e5c1379a9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;