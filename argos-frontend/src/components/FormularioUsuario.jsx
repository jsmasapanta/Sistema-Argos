import { useState } from 'react';

export default function FormularioUsuario({ onGuardar, onCancelar, guardando }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('piloto');

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ email, password, rol });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Nuevo usuario</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="nombre@argos.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña temporal</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="piloto">Piloto</option>
          <option value="operador">Operador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <p className="text-xs text-slate-400">
        Si el rol es "Piloto", después necesitarás completar su perfil (nombre, licencia) en la pantalla de Pilotos.
      </p>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-slate-900 text-white font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition disabled:opacity-50"
        >
          {guardando ? 'Creando...' : 'Crear usuario'}
        </button>
        <button type="button" onClick={onCancelar} className="text-slate-600 hover:text-slate-900 transition px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}