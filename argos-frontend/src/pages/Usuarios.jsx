import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listarUsuarios, registrarUsuario, cambiarEstadoUsuario, cambiarRolUsuario } from '../api/usuarios';
import FormularioUsuario from '../components/FormularioUsuario';
import ToastExito from '../components/ToastExito';

export default function Usuarios() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [toast, setToast] = useState('');
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading, isError } = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  });

  const mutation = useMutation({
    mutationFn: registrarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setMostrarForm(false);
      setToast('Usuario creado correctamente');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, activo }) => cambiarEstadoUsuario(id, activo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setToast(variables.activo ? 'Usuario activado' : 'Usuario desactivado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al actualizar el usuario');
    },
  });

  const rolMutation = useMutation({
    mutationFn: ({ id, rol }) => cambiarRolUsuario(id, rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setToast('Rol actualizado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al actualizar el rol');
    },
  });

  function handleCambiarRol(usuario, nuevoRol) {
    if (nuevoRol === usuario.rol) return;
    const confirmar = window.confirm(
      `¿Cambiar el rol de ${usuario.email} de "${usuario.rol}" a "${nuevoRol}"?\n\nSi este usuario tiene un perfil de piloto, no se eliminará automáticamente.`
    );
    if (confirmar) {
      rolMutation.mutate({ id: usuario.id, rol: nuevoRol });
    }
  }

  const colorRol = {
    admin: 'bg-slate-900 text-white',
    operador: 'bg-red-100 text-red-700',
    piloto: 'bg-slate-200 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nuevo usuario
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {mutation.isError && (
          <div className="mb-4 max-w-md bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {mutation.error?.response?.data?.error || 'Error al crear el usuario.'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-md">
            <FormularioUsuario
              onGuardar={(datos) => mutation.mutate(datos)}
              onCancelar={() => setMostrarForm(false)}
              guardando={mutation.isPending}
            />
          </div>
        )}

        {isLoading && <p className="text-slate-500">Cargando usuarios...</p>}
        {isError && <p className="text-red-600">Error al cargar los usuarios.</p>}

        {usuarios && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-slate-900">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.rol}
                        onChange={(e) => handleCambiarRol(u, e.target.value)}
                        disabled={rolMutation.isPending}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${colorRol[u.rol]}`}
                      >
                        <option value="admin">admin</option>
                        <option value="operador">operador</option>
                        <option value="piloto">piloto</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.creadoEn).toLocaleDateString('es-EC')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => estadoMutation.mutate({ id: u.id, activo: !u.activo })}
                        disabled={estadoMutation.isPending}
                        className={`text-sm font-medium ${
                          u.activo ? 'text-slate-400 hover:text-red-700' : 'text-green-700 hover:text-green-800'
                        } transition`}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ToastExito mensaje={toast} visible={!!toast} />
      </main>
    </div>
  );
}