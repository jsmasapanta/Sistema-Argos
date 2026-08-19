import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plane, Plus } from 'lucide-react';
import { listarUAVs, crearUAV, actualizarUAV, eliminarUAV, subirFotoUAV, finalizarMantenimientoUAV } from '../api/uavs';
import { crearMantenimiento } from '../api/mantenimientos';
import { urlFoto } from '../api/config';
import { necesitaMantenimientoPronto } from '../api/utils';
import Layout from '../components/Layout';
import FormularioUAV from '../components/FormularioUAV';
import FormularioMantenimiento from '../components/FormularioMantenimiento';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';

export default function UAVs() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [uavEditando, setUavEditando] = useState(null);
  const [uavParaMantenimiento, setUavParaMantenimiento] = useState(null);
  const [uavParaEliminar, setUavParaEliminar] = useState(null);
  const [toast, setToast] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const queryClient = useQueryClient();

  const { data: uavs, isLoading, isError } = useQuery({
    queryKey: ['uavs'],
    queryFn: listarUAVs,
  });

  const uavsFiltrados = uavs?.filter((u) => {
    const coincideBusqueda =
      u.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.modelo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || u.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const mutation = useMutation({
    mutationFn: async ({ datos, archivo, id }) => {
      const uav = id ? await actualizarUAV(id, datos) : await crearUAV(datos);
      if (archivo) await subirFotoUAV(uav.id, archivo);
      return uav;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setMostrarForm(false);
      setUavEditando(null);
      setToast('UAV guardado correctamente');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const mantenimientoMutation = useMutation({
    mutationFn: crearMantenimiento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setUavParaMantenimiento(null);
      setToast('Mantenimiento registrado');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const finalizarMutation = useMutation({
    mutationFn: finalizarMantenimientoUAV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setToast('UAV marcado como operativo');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarUAV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setUavParaEliminar(null);
      setToast('UAV eliminado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al eliminar el UAV');
      setUavParaEliminar(null);
    },
  });

  function handleGuardar(datos, archivo) {
    mutation.mutate({ datos, archivo, id: uavEditando?.id });
  }

  function abrirEdicion(uav) {
    setUavEditando(uav);
    setMostrarForm(true);
  }

  const badgeEstado = {
    operativo: 'bg-success/10 text-success',
    en_mantenimiento: 'bg-warning/10 text-warning',
    de_baja: 'bg-slate-200 text-slate-600',
  };

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Plane size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">UAVs</h1>
            <p className="text-sm text-slate-500 mt-1">Registro, estado y mantenimiento de la flota</p>
          </div>
          <button
            onClick={() => { setUavEditando(null); setMostrarForm(true); }}
            className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
          >
            <Plus size={16} /> Nuevo UAV
          </button>
        </div>

        {mostrarForm && (
          <div className="mb-6 max-w-md">
            <FormularioUAV
              uavInicial={uavEditando}
              onGuardar={handleGuardar}
              onCancelar={() => setMostrarForm(false)}
              guardando={mutation.isPending}
            />
          </div>
        )}

        {uavs && uavs.filter(necesitaMantenimientoPronto).length > 0 && (
          <div className="mb-4 bg-warning/10 border border-warning/30 text-warning text-sm px-4 py-3">
            ⚠ {uavs.filter(necesitaMantenimientoPronto).length} UAV(s) requieren mantenimiento pronto (50+ horas de vuelo).
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o modelo..."
            className="flex-1 max-w-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="todos">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="en_mantenimiento">En mantenimiento</option>
            <option value="de_baja">De baja</option>
          </select>
        </div>

        {isLoading && <p className="text-slate-500 text-sm">Cargando UAVs...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los UAVs.</p>}

        {uavs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {uavsFiltrados.map((uav) => (
              <div key={uav.id} className="bg-white border border-slate-200 overflow-hidden">
                <div onClick={() => abrirEdicion(uav)} className="h-44 bg-slate-100 flex items-center justify-center cursor-pointer">
                  {uav.fotoUrl ? (
                    <img src={urlFoto(uav.fotoUrl)} alt={uav.codigo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Sin foto</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-semibold text-navy-dark cursor-pointer" onClick={() => abrirEdicion(uav)}>
                      {uav.codigo}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${badgeEstado[uav.estado]}`}>
                      {uav.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{uav.modelo}</p>
                  <p className="text-xs text-slate-400 mt-2">{uav.horasTotales} h totales</p>
                  {necesitaMantenimientoPronto(uav) && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide bg-warning/10 text-warning">
                      Requiere mantenimiento
                    </span>
                  )}
                  <p className="text-[11px] text-slate-300 mt-2">
                    {uav.creadoPor ? `Creado por ${uav.creadoPor.email}` : 'Creador no registrado'} · {new Date(uav.creadoEn).toLocaleDateString('es-EC')}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                    {uav.estado === 'en_mantenimiento' ? (
                      <button
                        onClick={() => finalizarMutation.mutate(uav.id)}
                        disabled={finalizarMutation.isPending}
                        className="text-xs font-semibold uppercase tracking-wide text-success hover:opacity-70"
                      >
                        Marcar operativo
                      </button>
                    ) : (
                      <button
                        onClick={() => setUavParaMantenimiento(uav)}
                        className="text-xs font-semibold uppercase tracking-wide text-warning hover:opacity-70"
                      >
                        Registrar mantenimiento
                      </button>
                    )}
                    <button
                      onClick={() => setUavParaEliminar(uav)}
                      className="text-xs text-slate-400 hover:text-accent transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {uavsFiltrados.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10 text-sm">
                {busqueda || filtroEstado !== 'todos' ? 'Ningún UAV coincide con la búsqueda.' : 'Aún no hay UAVs registrados.'}
              </p>
            )}
          </div>
        )}

        {uavParaMantenimiento && (
          <FormularioMantenimiento
            uav={uavParaMantenimiento}
            onGuardar={(datos) => mantenimientoMutation.mutate(datos)}
            onCancelar={() => setUavParaMantenimiento(null)}
            guardando={mantenimientoMutation.isPending}
          />
        )}

        {uavParaEliminar && (
          <ConfirmarAccion
            mensaje={`¿Eliminar el UAV ${uavParaEliminar.codigo}? Esta acción no se puede deshacer.`}
            onConfirmar={() => eliminarMutation.mutate(uavParaEliminar.id)}
            onCancelar={() => setUavParaEliminar(null)}
          />
        )}

        <ToastExito mensaje={toast} visible={!!toast} />
      </div>
    </Layout>
  );
}