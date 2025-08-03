import React from 'react';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  // Estilos en formato de objeto de JavaScript
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5',
    },
    card: {
      padding: '40px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      width: '400px',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    subtitle: {
      color: '#666',
      marginBottom: '24px',
    },
    button: {
      backgroundColor: '#1877f2',
      color: 'white',
      fontWeight: 'bold',
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
    },
    googleIcon: {
      width: '24px',
      height: '24px',
      marginRight: '12px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>App Médica</h1>
        <p style={styles.subtitle}>Por favor, inicia sesión para continuar</p>
        <button style={styles.button} onClick={handleGoogleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google icon" style={styles.googleIcon} />
          Ingresar con Google
        </button>
      </div>
    </div>
  );
};

export default Login;