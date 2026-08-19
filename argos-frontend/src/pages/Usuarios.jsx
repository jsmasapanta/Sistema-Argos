import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus } from 'lucide-react';
import { listarUsuarios, registrarUsuario, cambiarEstadoUsuario, cambiarRolUsuario } from '../api/usuarios';
import Layout from '../components/Layout';
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
    onError: (error) => alert(error.response?.data?.error || 'Error al actualizar el usuario'),
  });

  const rolMutation = useMutation({
    mutationFn: ({ id, rol }) => cambiarRolUsuario(id, rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setToast('Rol actualizado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => alert(error.response?.data?.error || 'Error al actualizar el rol'),
  });

  function handleCambiarRol(usuario, nuevoRol) {
    if (nuevoRol === usuario.rol) return;
    const confirmar = window.confirm(
      `¿Cambiar el rol de ${usuario.email} de "${usuario.rol}" a "${nuevoRol}"?\n\nSi este usuario tiene un perfil de piloto, no se eliminará automáticamente.`
    );
    if (confirmar) rolMutation.mutate({ id: usuario.id, rol: nuevoRol });
  }

  const colorRol = {
    admin: 'bg-navy-dark text-white',
    operador: 'bg-accent/10 text-accent',
    piloto: 'bg-slate-200 text-slate-700',
  };

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <UserCog size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">Usuarios</h1>
            <p className="text-sm text-slate-500 mt-1">Cuentas y roles del sistema</p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
          >
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>

        {mutation.isError && (
          <div className="mb-4 max-w-md bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
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

        {isLoading && <p className="text-slate-500 text-sm">Cargando usuarios...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los usuarios.</p>}

        {usuarios && (
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Correo</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Rol</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Creado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-navy-dark font-medium">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.rol}
                        onChange={(e) => handleCambiarRol(u, e.target.value)}
                        disabled={rolMutation.isPending}
                        className={`text-[10px] px-2 py-1 font-semibold uppercase tracking-wide border-0 cursor-pointer ${colorRol[u.rol]}`}
                      >
                        <option value="admin">admin</option>
                        <option value="operador">operador</option>
                        <option value="piloto">piloto</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${u.activo ? 'bg-success/10 text-success' : 'bg-slate-200 text-slate-500'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.creadoEn).toLocaleDateString('es-EC')}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => estadoMutation.mutate({ id: u.id, activo: !u.activo })}
                        disabled={estadoMutation.isPending}
                        className={`text-xs font-semibold uppercase tracking-wide ${u.activo ? 'text-slate-400 hover:text-accent' : 'text-success hover:opacity-70'} transition`}
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
      </div>
    </Layout>
  );
}