import {onUserAfterCreate, UserRecord} from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import {logger} from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

// Esta es la sintaxis v2 correcta para la función
export const crearperfildeusuario = onUserAfterCreate(async (event: { data: UserRecord }) => {
  // El objeto del usuario ahora está en 'event.data'
  const user = event.data;
  const {email, displayName} = user;
  
  try {
    await db.collection("personal").add({
      email: email,
      nombre: displayName || "Usuario sin nombre",
      rol: "Auxiliar",
    });
    logger.log(`Perfil creado para el usuario: ${email}`);
  } catch (error) {
    logger.error(`Error al crear el perfil para ${email}:`, error);
  }
});