import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import { FIREBASE_API_KEY } from "@env"; // this MUST exist

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "dreamchat-5b840.firebaseapp.com",
  projectId: "dreamchat-5b840",
  storageBucket: "dreamchat-5b840.firebasestorage.app",
  messagingSenderId: "737419729548",
  appId: "1:737419729548:web:b41a173ae9c1be421379a9",
  databaseURL: "https://dreamchat-5b840-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Avoid duplicate initialization — REQUIRED in RN
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();
export default firebase;
