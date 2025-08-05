// src/components/Notes.jsx
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

  const styles = {
    container: { marginTop: '30px' },
    form: { marginBottom: '20px' },
    textarea: { width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    note: { backgroundColor: '#f9f9f9', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
    noteMeta: { fontSize: '0.8em', color: 'gray' }
  };

  return (
    <div style={styles.container}>
      <h3>Notas de Enfermería</h3>
      <form style={styles.form} onSubmit={handleAddNote}>
        <textarea 
          style={styles.textarea} 
          value={note} 
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe una nueva nota..."
        ></textarea>
        <button type="submit" style={styles.button}>Añadir Nota</button>
      </form>
      <div>
        {notes.map(n => (
          <div key={n.id} style={styles.note}>
            <p>{n.text}</p>
            <p style={styles.noteMeta}>
              Por {n.author} el {new Date(n.timestamp.seconds * 1000).toLocaleString('es-CO')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;