import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';

const Notes = ({ patientId }) => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const notesColRef = collection(db, "patients", patientId, "notes");
    const q = query(notesColRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await addDoc(collection(db, "patients", patientId, "notes"), {
        text: note,
        author: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: new Date()
      });
      setNote('');
    } catch (error) {
      console.error("Error al guardar la nota: ", error);
    }
  };

  return (
    <section>
      <h4>Notas de Enfermería</h4>
      <article>
        <form onSubmit={handleAddNote}>
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe una nueva nota general..."
            required
          ></textarea>
          <button type="submit">Añadir Nota</button>
        </form>
      </article>
      {notes.map(n => (
        <article key={n.id}>
          <p>{n.text}</p>
          <footer>
            <small>Por {n.author} el {new Date(n.timestamp.seconds * 1000).toLocaleString('es-CO')}</small>
          </footer>
        </article>
      ))}
    </section>
  );
};

export default Notes;