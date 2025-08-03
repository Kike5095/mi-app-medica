// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// ESTAS LÍNEAS FALTABAN
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5qQ2fQN7fZoQ4zvjDfsdzO1wTmI5oNF4",
  authDomain: "mi-app-medica-ef3fa.firebaseapp.com",
  projectId: "mi-app-medica-ef3fa",
  storageBucket: "mi-app-medica-ef3fa.firebasestorage.app",
  messagingSenderId: "713331216336",
  appId: "1:713331216336:web:db2026dfc8b98c60c133d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- Y ESTAS LÍNEAS DE EXPORTACIÓN TAMBIÉN FALTABAN ---
export const auth = getAuth(app);
export const db = getFirestore(app);