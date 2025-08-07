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

  return (
    <article>
      <h4>Personal Registrado</h4>
      <figure>
        <table>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Email</th>
              <th scope="col">Rol</th>
              <th scope="col">Admin</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td>{member.nombre}</td>
                <td>{member.email}</td>
                <td>{member.rol}</td>
                <td>{member.isAdmin ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </article>
  );
};

export default StaffList;