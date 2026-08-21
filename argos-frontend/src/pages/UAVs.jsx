import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plane, Plus, CheckCircle2, Wrench, MinusCircle, Eye, MoreVertical,
  Weight, Timer, MapPin, Gauge, Camera, Hash, Calendar, LayoutGrid, List,
} from 'lucide-react';
import { listarUAVs, crearUAV, actualizarUAV, eliminarUAV, subirFotoUAV, finalizarMantenimientoUAV } from '../api/uavs';
import { crearMantenimiento } from '../api/mantenimientos';
import { urlFoto } from '../api/config';
import { necesitaMantenimientoPronto } from '../api/utils';
import Layout from '../components/Layout';
import FormularioUAV from '../components/FormularioUAV';
import FormularioMantenimiento from '../components/FormularioMantenimiento';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';

const POR_PAGINA = 6;
const UMBRAL_HORAS = 50;

export default function UAVs() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [uavEditando, setUavEditando] = useState(null);
  const [uavParaMantenimiento, setUavParaMantenimiento] = useState(null);
  const [uavParaEliminar, setUavParaEliminar] = useState(null);
  const [toast, setToast] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroModelo, setFiltroModelo] = useState('todos');
  const [vista, setVista] = useState('tarjetas');
  const [pagina, setPagina] = useState(1);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const queryClient = useQueryClient();

  const { data: uavs, isLoading, isError } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });

  const modelos = [...new Set((uavs || []).map((u) => u.modelo))];

  const uavsFiltrados = (uavs || []).filter((u) => {
    const coincideBusqueda = u.codigo.toLowerCase().includes(busqueda.toLowerCase()) || u.modelo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || u.estado === filtroEstado;
    const coincideModelo = filtroModelo === 'todos' || u.modelo === filtroModelo;
    return coincideBusqueda && coincideEstado && coincideModelo;
  });

  const totalPaginas = Math.max(1, Math.ceil(uavsFiltrados.length / POR_PAGINA));
  const uavsPagina = uavsFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalRegistrados = uavs?.length || 0;
  const totalOperativos = uavs?.filter((u) => u.estado === 'operativo').length || 0;
  const totalMantenimientoProximo = uavs?.filter(necesitaMantenimientoPronto).length || 0;
  const totalDeBaja = uavs?.filter((u) => u.estado === 'de_baja').length || 0;
  const disponibilidad = totalRegistrados > 0 ? Math.round((totalOperativos / totalRegistrados) * 100) : 0;

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
    operativo: { texto: 'Operativo', clase: 'bg-success/10 text-success', barra: 'bg-success' },
    en_mantenimiento: { texto: 'Requiere mantenimiento', clase: 'bg-warning/10 text-warning', barra: 'bg-warning' },
    de_baja: { texto: 'De baja', clase: 'bg-slate-200 text-slate-600', barra: 'bg-navy' },
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
            <FormularioUAV uavInicial={uavEditando} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} guardando={mutation.isPending} />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane size={15} className="text-navy" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalRegistrados}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">UAV registrados</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-success" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalOperativos}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Operativos</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={15} className="text-warning" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalMantenimientoProximo}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Mantenimiento próximo</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MinusCircle size={15} className="text-slate-400" />
              <p className="text-2xl font-display font-semibold text-navy-dark">{totalDeBaja}</p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">De baja</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Disponibilidad operacional</p>
            <p className="text-2xl font-display font-semibold text-navy-dark mb-1.5">{disponibilidad}%</p>
            <div className="h-1.5 bg-slate-100 w-full">
              <div className="h-full bg-success" style={{ width: `${disponibilidad}%` }} />
            </div>
          </div>
        </div>

        {totalMantenimientoProximo > 0 && (
          <div className="mb-5 bg-warning/10 border border-warning/30 text-warning text-sm px-4 py-3">
            ⚠ {totalMantenimientoProximo} UAV(s) requieren mantenimiento pronto ({UMBRAL_HORAS}+ horas de vuelo).
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por código o modelo..."
            className="flex-1 min-w-[200px] max-w-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
            className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="todos">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="en_mantenimiento">En mantenimiento</option>
            <option value="de_baja">De baja</option>
          </select>
          <select
            value={filtroModelo}
            onChange={(e) => { setFiltroModelo(e.target.value); setPagina(1); }}
            className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="todos">Todos los modelos</option>
            {modelos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <div className="ml-auto flex border border-slate-300">
            <button
              onClick={() => setVista('tarjetas')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${vista === 'tarjetas' ? 'bg-navy-dark text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={14} /> Tarjetas
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-l border-slate-300 ${vista === 'tabla' ? 'bg-navy-dark text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <List size={14} /> Tabla
            </button>
          </div>
        </div>

        {isLoading && <p className="text-slate-500 text-sm">Cargando UAVs...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los UAVs.</p>}

        {uavs && vista === 'tarjetas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {uavsPagina.map((uav) => {
              const b = badgeEstado[uav.estado];
              return (
                <div key={uav.id} className="bg-white border border-slate-200 overflow-hidden">
                  <div className={`h-1 ${b.barra}`} />
                  <div className="relative h-40 bg-slate-100 flex items-center justify-center">
                    {uav.fotoUrl ? (
                      <img src={urlFoto(uav.fotoUrl)} alt={uav.codigo} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Sin foto</span>
                    )}
                    <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide bg-white ${b.clase}`}>
                      {b.texto}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-navy-dark text-lg">{uav.codigo}</h3>
                    <p className="text-sm text-slate-500 mb-3">{uav.modelo}</p>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500"><Timer size={12} /> Horas de vuelo</span>
                        <span className="text-navy-dark font-medium">{uav.horasTotales} h</span>
                      </div>
                      <div className="h-1 bg-slate-100">
                        <div className={`h-full ${uav.horasTotales >= UMBRAL_HORAS ? 'bg-warning' : 'bg-navy'}`} style={{ width: `${Math.min(100, (uav.horasTotales / 250) * 100)}%` }} />
                      </div>

                      {uav.pesoMaximo && <div className="flex items-center justify-between pt-1"><span className="flex items-center gap-1.5 text-slate-500"><Weight size={12} /> Peso máximo</span><span className="text-navy-dark">{uav.pesoMaximo} kg</span></div>}
                      {uav.autonomia && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Timer size={12} /> Autonomía</span><span className="text-navy-dark">{uav.autonomia} min</span></div>}
                      {uav.alcanceMax && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><MapPin size={12} /> Alcance máx.</span><span className="text-navy-dark">{uav.alcanceMax} km</span></div>}
                      {uav.velocidadMax && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Gauge size={12} /> Velocidad máx.</span><span className="text-navy-dark">{uav.velocidadMax} m/s</span></div>}
                      {uav.camara && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Camera size={12} /> Cámara</span><span className="text-navy-dark truncate max-w-[140px]">{uav.camara}</span></div>}
                      {uav.serialId && <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Hash size={12} /> Serial / ID</span><span className="text-navy-dark">{uav.serialId}</span></div>}
                      <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-slate-500"><Calendar size={12} /> Registro</span><span className="text-navy-dark">{new Date(uav.creadoEn).toLocaleDateString('es-EC')}</span></div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 relative">
                      <button onClick={() => abrirEdicion(uav)} className="flex-1 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 text-xs font-medium py-2 hover:bg-slate-50">
                        <Eye size={13} /> Ver detalles
                      </button>
                      <button
                        onClick={() => setMenuAbierto(menuAbierto === uav.id ? null : uav.id)}
                        className="px-3 border border-slate-300 text-slate-400 hover:text-navy-dark"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {menuAbierto === uav.id && (
                        <div className="absolute right-0 bottom-11 bg-white border border-slate-200 shadow-lg w-52 z-10">
                          {uav.estado === 'en_mantenimiento' ? (
                            <button
                              onClick={() => { finalizarMutation.mutate(uav.id); setMenuAbierto(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-success hover:bg-success/5 text-left"
                            >
                              <CheckCircle2 size={13} /> Marcar como operativo
                            </button>
                          ) : (
                            <button
                              onClick={() => { setUavParaMantenimiento(uav); setMenuAbierto(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-warning hover:bg-warning/5 text-left"
                            >
                              <Wrench size={13} /> Registrar mantenimiento
                            </button>
                          )}
                          <button
                            onClick={() => { setUavParaEliminar(uav); setMenuAbierto(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-accent hover:bg-accent/5 text-left border-t border-slate-100"
                          >
                            Eliminar UAV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {uavsPagina.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10 text-sm">
                {busqueda || filtroEstado !== 'todos' || filtroModelo !== 'todos' ? 'Ningún UAV coincide con la búsqueda.' : 'Aún no hay UAVs registrados.'}
              </p>
            )}
          </div>
        )}

        {uavs && vista === 'tabla' && (
          <div className="bg-white border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Código</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Modelo</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Horas</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Serial</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uavsPagina.map((uav) => {
                  const b = badgeEstado[uav.estado];
                  return (
                    <tr key={uav.id} className="hover:bg-ice/40 cursor-pointer" onClick={() => abrirEdicion(uav)}>
                      <td className="px-4 py-3 text-navy-dark font-medium">{uav.codigo}</td>
                      <td className="px-4 py-3 text-slate-600">{uav.modelo}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${b.clase}`}>{b.texto}</span></td>
                      <td className="px-4 py-3 text-slate-600">{uav.horasTotales} h</td>
                      <td className="px-4 py-3 text-slate-500">{uav.serialId || '—'}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setUavParaEliminar(uav)} className="text-xs text-slate-400 hover:text-accent">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {uavsPagina.length === 0 && <p className="text-slate-400 text-center py-10 text-sm">Sin resultados.</p>}
          </div>
        )}

        {uavsFiltrados.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-slate-400">
              Mostrando {uavsPagina.length} de {uavsFiltrados.length} UAV
            </p>
            {totalPaginas > 1 && (
              <div className="flex gap-1">
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
          </div>
        )}

        {uavParaMantenimiento && (
          <FormularioMantenimiento uav={uavParaMantenimiento} onGuardar={(datos) => mantenimientoMutation.mutate(datos)} onCancelar={() => setUavParaMantenimiento(null)} guardando={mantenimientoMutation.isPending} />
        )}
        {uavParaEliminar && (
          <ConfirmarAccion mensaje={`¿Eliminar el UAV ${uavParaEliminar.codigo}? Esta acción no se puede deshacer.`} onConfirmar={() => eliminarMutation.mutate(uavParaEliminar.id)} onCancelar={() => setUavParaEliminar(null)} />
        )}
        <ToastExito mensaje={toast} visible={!!toast} />
      </div>
    </Layout>
  );
}