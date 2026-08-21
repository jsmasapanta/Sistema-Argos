import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Plus, CheckCircle2, AlertTriangle, ImageOff, Eye, Pencil, MoreVertical,
  Calendar, UserRound, Plane, Clock, Award,
} from 'lucide-react';
import { listarPilotos, crearPiloto, actualizarPiloto, eliminarPiloto, subirFotoPiloto } from '../api/pilotos';
import { urlFoto } from '../api/config';
import { estadoLicencia } from '../api/utils';
import Layout from '../components/Layout';
import FormularioPiloto from '../components/FormularioPiloto';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';

const POR_PAGINA = 6;

export default function Pilotos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pilotoEditando, setPilotoEditando] = useState(null);
  const [pilotoParaEliminar, setPilotoParaEliminar] = useState(null);
  const [toast, setToast] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroVigencia, setFiltroVigencia] = useState('todos');
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [pagina, setPagina] = useState(1);
  const queryClient = useQueryClient();

  const { data: pilotos, isLoading, isError } = useQuery({ queryKey: ['pilotos'], queryFn: listarPilotos });

  const pilotosConEstado = (pilotos || []).map((p) => ({ ...p, _estado: estadoLicencia(p.vencimientoLicencia) }));

  const pilotosFiltrados = pilotosConEstado.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.licencia.toLowerCase().includes(busqueda.toLowerCase());
    const coincideVigencia = filtroVigencia === 'todos' || p._estado.nivel === filtroVigencia;
    return coincideBusqueda && coincideVigencia;
  });

  const totalPaginas = Math.max(1, Math.ceil(pilotosFiltrados.length / POR_PAGINA));
  const pilotosPagina = pilotosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalRegistrados = pilotos?.length || 0;
  const totalActivos = pilotosConEstado.filter((p) => p._estado.nivel === 'vigente').length;
  const totalPorVencer = pilotosConEstado.filter((p) => p._estado.nivel === 'por_vencer' || p._estado.nivel === 'vencida').length;
  const totalSinFoto = pilotos?.filter((p) => !p.fotoUrl).length || 0;

  const mutation = useMutation({
    mutationFn: async ({ datos, archivo, id }) => {
      const piloto = id ? await actualizarPiloto(id, datos) : await crearPiloto(datos);
      if (archivo) await subirFotoPiloto(piloto.id, archivo);
      return piloto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotos'] });
      setMostrarForm(false);
      setPilotoEditando(null);
      setToast('Piloto guardado correctamente');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => console.error('Error al guardar piloto:', error),
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarPiloto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotos'] });
      setPilotoParaEliminar(null);
      setToast('Piloto eliminado');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al eliminar el piloto');
      setPilotoParaEliminar(null);
    },
  });

  function handleGuardar(datos, archivo) {
    mutation.mutate({ datos, archivo, id: pilotoEditando?.id });
  }

  function abrirEdicion(piloto) {
    setPilotoEditando(piloto);
    setMostrarForm(true);
  }

  const badgeVigencia = {
    vigente: { texto: 'Activo', clase: 'bg-success/10 text-success' },
    por_vencer: { texto: 'Por vencer', clase: 'bg-warning/10 text-warning' },
    vencida: { texto: 'Vencida', clase: 'bg-accent/10 text-accent' },
  };

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Users size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">Pilotos</h1>
            <p className="text-sm text-slate-500 mt-1">Personal habilitado para operar UAVs</p>
          </div>
          <button
            onClick={() => { setPilotoEditando(null); setMostrarForm(true); }}
            className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
          >
            <Plus size={16} /> Nuevo Piloto
          </button>
        </div>

        {mutation.isError && (
          <div className="mb-4 max-w-md bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
            {mutation.error?.response?.data?.error || 'Ocurrió un error al guardar. Revisa la consola (F12).'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-md">
            <FormularioPiloto pilotoInicial={pilotoEditando} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} guardando={mutation.isPending} />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={15} className="text-navy" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalRegistrados}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pilotos registrados</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-success" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalActivos}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Activos</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-warning" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalPorVencer}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Licencia por vencer</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff size={15} className="text-slate-400" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalSinFoto}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Sin foto</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por nombre o licencia..."
            className="flex-1 min-w-[200px] max-w-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <select
            value={filtroVigencia}
            onChange={(e) => { setFiltroVigencia(e.target.value); setPagina(1); }}
            className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="todos">Todas las vigencias</option>
            <option value="vigente">Activo</option>
            <option value="por_vencer">Por vencer</option>
            <option value="vencida">Vencida</option>
          </select>
          <p className="ml-auto text-xs text-slate-400">Mostrando {pilotosPagina.length} de {pilotosFiltrados.length} pilotos</p>
        </div>

        {isLoading && <p className="text-slate-500 text-sm">Cargando pilotos...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los pilotos.</p>}

        {pilotos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pilotosPagina.map((piloto) => {
              const b = badgeVigencia[piloto._estado.nivel];
              return (
                <div key={piloto.id} className="bg-white border border-slate-200 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {piloto.fotoUrl ? (
                        <img src={urlFoto(piloto.fotoUrl)} alt={piloto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound size={22} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-navy-dark truncate">{piloto.nombre}</h3>
                      <p className="text-xs text-slate-500 truncate">{piloto.licencia}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${b.clase}`}>{b.texto}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500"><Calendar size={12} /> Vence</span>
                      <span className={piloto._estado.nivel === 'vigente' ? 'text-navy-dark' : piloto._estado.nivel === 'vencida' ? 'text-accent font-medium' : 'text-warning font-medium'}>
                        {new Date(piloto.vencimientoLicencia).toLocaleDateString('es-EC')}
                      </span>
                    </div>
                    {piloto.rango && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Award size={12} /> Rango</span><span className="text-navy-dark">{piloto.rango}</span></div>}
                    {piloto.especialidad && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><UserRound size={12} /> Especialidad</span><span className="text-navy-dark">{piloto.especialidad}</span></div>}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500"><Plane size={12} /> UAV asignado</span>
                      <span className="text-navy-dark">{piloto.uavAsignado?.codigo || 'No asignado'}</span>
                    </div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Clock size={12} /> Registrado</span><span className="text-navy-dark">{new Date(piloto.creadoEn).toLocaleDateString('es-EC')}</span></div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 relative">
                    <button onClick={() => abrirEdicion(piloto)} className="flex-1 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 text-xs font-medium py-2 hover:bg-slate-50">
                      <Eye size={13} /> Ver detalles
                    </button>
                    <button
                      onClick={() => setMenuAbierto(menuAbierto === piloto.id ? null : piloto.id)}
                      className="px-3 border border-slate-300 text-slate-400 hover:text-navy-dark"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {menuAbierto === piloto.id && (
                      <div className="absolute right-0 bottom-11 bg-white border border-slate-200 shadow-lg w-44 z-10">
                        <button
                          onClick={() => { abrirEdicion(piloto); setMenuAbierto(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-navy-dark hover:bg-ice/60 text-left"
                        >
                          <Pencil size={13} /> Editar piloto
                        </button>
                        <button
                          onClick={() => { setPilotoParaEliminar(piloto); setMenuAbierto(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-accent hover:bg-accent/5 text-left border-t border-slate-100"
                        >
                          Eliminar piloto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {pilotosPagina.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10 text-sm">
                {busqueda || filtroVigencia !== 'todos' ? 'Ningún piloto coincide con la búsqueda.' : 'Aún no hay pilotos registrados.'}
              </p>
            )}
          </div>
        )}

        {pilotosFiltrados.length > 0 && totalPaginas > 1 && (
          <div className="flex justify-end gap-1 mt-6">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPagina(p)}
                className={`w-8 h-8 text-sm ${p === pagina ? 'bg-navy-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {pilotoParaEliminar && (
          <ConfirmarAccion mensaje={`¿Eliminar a ${pilotoParaEliminar.nombre}? Esta acción no se puede deshacer.`} onConfirmar={() => eliminarMutation.mutate(pilotoParaEliminar.id)} onCancelar={() => setPilotoParaEliminar(null)} />
        )}
        <ToastExito mensaje={toast} visible={!!toast} />
      </div>
    </Layout>
  );
}