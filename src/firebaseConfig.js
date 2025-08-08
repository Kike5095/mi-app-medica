// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase (rellena con tus valores)
const firebaseConfig = {
  apiKey: "AIzaSyD5qQ2fQN7fZoQ4zvjDfsdzO1wTmI5oNF4",
  authDomain: "mi-app-medica-ef3fa.firebaseapp.com",
  projectId: "mi-app-medica-ef3fa",
  storageBucket: "mi-app-medica-ef3fa.firebasestorage.app",
  messagingSenderId: "713331216336",
  appId: "1:713331216336:web:db2026dfc8b98c60c133d5"
};

// Inicializar la app
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar todo lo necesario para evitar errores de importación
export { app, db, auth };
