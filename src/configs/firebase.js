import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_API_KEY } from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "dreamchat-5b840.firebaseapp.com",
  projectId: "dreamchat-5b840",
  storageBucket: "dreamchat-5b840.firebasestorage.app",
  messagingSenderId: "737419729548",
  appId: "1:737419729548:web:b41a173ae9c1be421379a9",
  databaseURL: "https://dreamchat-5b840-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getDatabase(app);
export default app;