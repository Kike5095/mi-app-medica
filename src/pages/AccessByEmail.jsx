import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  findUserByEmail,
  resolveRole,
  destinationForRole,
  normalizeEmail,
} from '../lib/auth';

export default function AccessByEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const value = normalizeEmail(email);
    if (!value) {
      setError('Ingresa un correo válido.');
      return;
    }
    setLoading(true);
    try {
      const user = await findUserByEmail(value);
      if (!user) {
        setError('No se encontró tu correo. Te llevaremos al registro.');
        navigate(`/create-account?email=${encodeURIComponent(value)}`);
        return;
      }
      const role = resolveRole(value, user);
      localStorage.setItem('role', role);
      localStorage.setItem('userEmail', value);
      localStorage.setItem('userName', user.nombreCompleto || user.nombre || '');
      localStorage.setItem('userCedula', user.cedula || '');
      navigate(destinationForRole(role), { replace: true });
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al validar tu acceso. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app">
      <div className="card p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Acceso del personal</h1>
        <p className="text-slate-600 mb-6">
          Ingresa con correo registrado. Si no estás en la lista, podrás registrarte.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            className="w-full input"
            placeholder="tucorreo@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Validando…' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}

