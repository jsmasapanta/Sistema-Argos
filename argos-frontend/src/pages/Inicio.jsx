import { useAuth } from '../context/AuthContext';

export default function Inicio() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {usuario?.email}</h1>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
      <p className="text-slate-500">Rol: {usuario?.rol}</p>
    </div>
  );
}