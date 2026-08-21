import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, Calendar, Clock, BarChart3, AlertTriangle, Eye, MoreVertical, Download } from 'lucide-react';
import { listarVuelos, crearVuelo, actualizarVuelo } from '../api/vuelos';
import { listarUAVs } from '../api/uavs';
import { listarPilotos } from '../api/pilotos';
import Layout from '../components/Layout';
import FormularioVuelo from '../components/FormularioVuelo';
import DetalleVuelo from '../components/DetalleVuelo';

const POR_PAGINA = 8;

export default function Vuelos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroUav, setFiltroUav] = useState('todos');
  const [filtroPiloto, setFiltroPiloto] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const queryClient = useQueryClient();

  const { data: vuelos, isLoading, isError } = useQuery({ queryKey: ['vuelos'], queryFn: listarVuelos });
  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });
  const { data: pilotos } = useQuery({ queryKey: ['pilotos'], queryFn: listarPilotos });

  const mutation = useMutation({
    mutationFn: crearVuelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vuelos'] });
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setMostrarForm(false);
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, datos }) => actualizarVuelo(id, datos),
    onSuccess: (vueloActualizado) => {
      queryClient.invalidateQueries({ queryKey: ['vuelos'] });
      setVueloSeleccionado((v) => (v ? { ...v, ...vueloActualizado } : v));
    },
  });

  function calcularHoras(inicio, fin) {
    return ((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60)).toFixed(1);
  }

  const vuelosFiltrados = (vuelos || []).filter((v) => {
    const texto = `${v.piloto?.nombre} ${v.uav?.codigo} ${v.mision || ''}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    const coincideUav = filtroUav === 'todos' || v.uavId === filtroUav;
    const coincidePiloto = filtroPiloto === 'todos' || v.pilotoId === filtroPiloto;
    const coincideEstado = filtroEstado === 'todos' || v.estado === filtroEstado;
    return coincideBusqueda && coincideUav && coincidePiloto && coincideEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(vuelosFiltrados.length / POR_PAGINA));
  const vuelosPagina = vuelosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalVuelos = vuelos?.length || 0;
  const horasAcumuladas = vuelos?.reduce((acc, v) => acc + parseFloat(calcularHoras(v.fechaInicio, v.fechaFin)), 0) || 0;
  const ahora = new Date();
  const vuelosEsteMes = vuelos?.filter((v) => {
    const f = new Date(v.fechaInicio);
    return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
  }).length || 0;
  const totalConNovedad = vuelos?.filter((v) => v.estado === 'con_novedad').length || 0;

  const badgeEstado = {
    completado: 'bg-success/10 text-success',
    finalizado: 'bg-navy/10 text-navy',
    con_novedad: 'bg-warning/10 text-warning',
  };
  const textoEstado = { completado: 'Completado', finalizado: 'Finalizado', con_novedad: 'Con novedad' };

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <ClipboardList size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">Bitácora de Vuelos</h1>
            <p className="text-sm text-slate-500 mt-1">Registro cronológico de la operación</p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
          >
            <Plus size={16} /> Registrar vuelo
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Calendar size={15} className="text-navy" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalVuelos}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Vuelos registrados</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Clock size={15} className="text-success" /><p className="text-2xl font-display font-semibold text-navy-dark">{horasAcumuladas.toFixed(1)} h</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Horas acumuladas</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart3 size={15} className="text-gold" /><p className="text-2xl font-display font-semibold text-navy-dark">{vuelosEsteMes}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Vuelos este mes</p>
          </div>
          <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} className="text-warning" /><p className="text-2xl font-display font-semibold text-navy-dark">{totalConNovedad}</p></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Con novedad</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por piloto, UAV o misión..."
            className="flex-1 min-w-[220px] border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <select value={filtroUav} onChange={(e) => { setFiltroUav(e.target.value); setPagina(1); }} className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy">
            <option value="todos">Todos los UAV</option>
            {uavs?.map((u) => <option key={u.id} value={u.id}>{u.codigo}</option>)}
          </select>
          <select value={filtroPiloto} onChange={(e) => { setFiltroPiloto(e.target.value); setPagina(1); }} className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy">
            <option value="todos">Todos los pilotos</option>
            {pilotos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }} className="border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy">
            <option value="todos">Todos los estados</option>
            <option value="completado">Completado</option>
            <option value="finalizado">Finalizado</option>
            <option value="con_novedad">Con novedad</option>
          </select>
        </div>

        {mutation.isError && (
          <div className="mb-4 bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
            {mutation.error?.response?.data?.error || 'Error al registrar el vuelo.'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-lg">
            <FormularioVuelo onGuardar={(datos) => mutation.mutate(datos)} onCancelar={() => setMostrarForm(false)} guardando={mutation.isPending} />
          </div>
        )}

        {isLoading && <p className="text-slate-500 text-sm">Cargando vuelos...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los vuelos.</p>}

        {vuelos && (
          <div className={`grid gap-6 ${vueloSeleccionado ? 'grid-cols-1 xl:grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
            <div className="bg-white border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-dark text-white text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Piloto</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">UAV</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Misión</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Fecha</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Duración</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vuelosPagina.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setVueloSeleccionado(v)}
                      className={`cursor-pointer ${vueloSeleccionado?.id === v.id ? 'bg-ice/60' : 'hover:bg-ice/30'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-navy-dark font-medium">{v.piloto?.nombre}</p>
                        <p className="text-xs text-slate-400">{v.piloto?.licencia}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{v.uav?.codigo}</td>
                      <td className="px-4 py-3 text-slate-600">{v.mision || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(v.fechaInicio).toLocaleDateString('es-EC')}</td>
                      <td className="px-4 py-3 text-slate-600">{calcularHoras(v.fechaInicio, v.fechaFin)} h</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${badgeEstado[v.estado]}`}>{textoEstado[v.estado]}</span></td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setVueloSeleccionado(v)} className="text-slate-400 hover:text-navy-dark"><Eye size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vuelosPagina.length === 0 && <p className="text-slate-400 text-center py-10 text-sm">Sin vuelos que coincidan con la búsqueda.</p>}

              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">Mostrando {vuelosPagina.length} de {vuelosFiltrados.length} vuelos</p>
                <div className="flex items-center gap-2">
                  {totalPaginas > 1 && (
                    <div className="flex gap-1">
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPagina(p)} className={`w-7 h-7 text-xs ${p === pagina ? 'bg-navy-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                      ))}
                    </div>
                  )}
                  <a href={`${import.meta.env.VITE_API_URL}/reportes/exportar/excel`} className="flex items-center gap-1.5 border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-50">
                    <Download size={13} /> Exportar
                  </a>
                </div>
              </div>
            </div>

            {vueloSeleccionado && (
              <DetalleVuelo
                vuelo={vueloSeleccionado}
                onCerrar={() => setVueloSeleccionado(null)}
                onEditar={() => {}}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}