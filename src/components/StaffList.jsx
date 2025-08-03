// src/components/StaffList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const StaffList = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "personal"), (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffData);
    });
    return () => unsubscribe();
  }, []);
  
  const styles = {
    container: { marginTop: '30px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' }
  };

  return (
    <div style={styles.container}>
      <h3>Personal Registrado</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rol</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(member => (
            <tr key={member.id}>
              <td style={styles.td}>{member.nombre}</td>
              <td style={styles.td}>{member.email}</td>
              <td style={styles.td}>{member.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;