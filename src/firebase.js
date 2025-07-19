// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8-XIVey6YXlIVdvDDgulJmBY5EiWkxL4",
  authDomain: "marine-learning-app.firebaseapp.com",
  projectId: "marine-learning-app",
  storageBucket: "marine-learning-app.firebasestorage.app",
  messagingSenderId: "211652187379",
  appId: "1:211652187379:web:04fc6c7eba9a24fee01386"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
