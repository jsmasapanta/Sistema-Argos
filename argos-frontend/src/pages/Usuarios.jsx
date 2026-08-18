import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listarUsuarios, registrarUsuario } from '../api/usuarios';
import FormularioUsuario from '../components/FormularioUsuario';

export default function Usuarios() {
  const [mostrarForm, setMostrarForm] = useState(false);
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
    },
  });

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
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
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
                  <th className="px-4 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-slate-900">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorRol[u.rol]}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.creadoEn).toLocaleDateString('es-EC')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}