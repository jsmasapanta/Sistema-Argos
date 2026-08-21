import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Users, CheckCircle2, XCircle, ShieldCheck, Clock } from 'lucide-react';
import { listarUsuarios, registrarUsuario, cambiarEstadoUsuario, cambiarRolUsuario, eliminarUsuario } from '../api/usuarios';
import { tiempoRelativo } from '../api/utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FormularioUsuario from '../components/FormularioUsuario';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';

const POR_PAGINA = 8;

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioParaEliminar, setUsuarioParaEliminar] = useState(null);
  const [toast, setToast] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading, isError } = useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });

  const usuariosFiltrados = (usuarios || []).filter((u) => {
    const coincideBusqueda = u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol;
    const coincideEstado = filtroEstado === 'todos' || (filtroEstado === 'activo' ? u.activo : !u.activo);
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));
  const usuariosPagina = usuariosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalUsuarios = usuarios?.length || 0;
  const totalActivos = usuarios?.filter((u) => u.activo).length || 0;
  const totalInactivos = totalUsuarios - totalActivos;
  const totalAdmins = usuarios?.filter((u) => u.rol === 'admin').length || 0;

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

  const eliminarMutation = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setUsuarioParaEliminar(null);
      setToast('Usuario eliminado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al eliminar el usuario');
      setUsuarioParaEliminar(null);
    },
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Users size={15} className="text-navy" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalUsuarios}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Usuarios totales</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={15} className="text-success" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalActivos}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Activos · {totalUsuarios ? Math.round((totalActivos / totalUsuarios) * 100) : 0}%</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><XCircle size={15} className="text-accent" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalInactivos}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Inactivos · {totalUsuarios ? Math.round((totalInactivos / totalUsuarios) * 100) : 0}%</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck size={15} className="text-gold" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalAdmins}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Administradores</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por correo..."
            className="flex-1 min-w-[200px] max-w-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <select value={filtroRol} onChange={(e) => { setFiltroRol(e.target.value); setPagina(1); }} className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy">
            <option value="todos">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
            <option value="piloto">Piloto</option>
          </select>
          <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }} className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <p className="ml-auto text-xs text-slate-400">Mostrando {usuariosPagina.length} de {usuariosFiltrados.length}</p>
        </div>

        {mutation.isError && (
          <div className="mb-4 max-w-md bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
            {mutation.error?.response?.data?.error || 'Error al crear el usuario.'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-md">
            <FormularioUsuario onGuardar={(datos) => mutation.mutate(datos)} onCancelar={() => setMostrarForm(false)} guardando={mutation.isPending} />
          </div>
        )}

        {isLoading && <p className="text-slate-500 text-sm">Cargando usuarios...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los usuarios.</p>}

        {usuarios && (
          <div className="bg-white border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Correo</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Rol</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Último acceso</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Creado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosPagina.map((u) => {
                  const esUnoMismo = u.id === usuarioActual?.id;
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-navy-dark font-medium">
                        {u.email} {esUnoMismo && <span className="text-[10px] text-slate-400">(tú)</span>}
                      </td>
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
                      <td className="px-4 py-3 text-slate-500 text-xs flex items-center gap-1.5"><Clock size={11} /> {tiempoRelativo(u.ultimoAcceso)}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(u.creadoEn).toLocaleDateString('es-EC')}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => estadoMutation.mutate({ id: u.id, activo: !u.activo })}
                          disabled={estadoMutation.isPending}
                          className={`text-xs font-medium mr-3 ${u.activo ? 'text-slate-400 hover:text-accent' : 'text-success hover:opacity-80'} transition`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        {!esUnoMismo && (
                          <button
                            onClick={() => setUsuarioParaEliminar(u)}
                            className="text-xs font-medium text-slate-400 hover:text-accent transition"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {usuariosPagina.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-sm">Ningún usuario coincide con la búsqueda.</td></tr>
                )}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="flex justify-end gap-1 px-4 py-3 border-t border-slate-100">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPagina(p)} className={`w-7 h-7 text-xs ${p === pagina ? 'bg-navy-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {usuarioParaEliminar && (
          <ConfirmarAccion
            mensaje={`¿Eliminar la cuenta de ${usuarioParaEliminar.email}? Esta acción no se puede deshacer.`}
            onConfirmar={() => eliminarMutation.mutate(usuarioParaEliminar.id)}
            onCancelar={() => setUsuarioParaEliminar(null)}
          />
        )}

        <ToastExito mensaje={toast} visible={!!toast} />
      </div>
    </Layout>
  );
}