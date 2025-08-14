import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import AdminView from "./components/AdminView.jsx";
import MedicoView from "./components/MedicoView.jsx";
import AuxiliarView from "./components/AuxiliarView.jsx";
import Login from "./components/Login.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <Login />;
  }

  if (user.email === "admin@tuapp.com") {
    return <AdminView user={user} />;
  }

  if (user.email === "medico@tuapp.com") {
    return <MedicoView user={user} />;
  }

  return <AuxiliarView user={user} />;
}

