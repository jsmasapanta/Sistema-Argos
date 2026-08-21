import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, Download, FileText, Plane, ShieldCheck, UserRound, ClipboardList, Clock,
  Users2, Wrench, ListChecks, History, ChevronRight, SlidersHorizontal, Calendar,
  Target, RotateCcw, Sparkles, FileBarChart, Table2, LineChart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  resumenGeneral, horasPorPiloto, horasPorUAV, historialMantenimiento,
  descargarPDF, descargarExcel,
} from '../api/reportes';
import { listarVuelos } from '../api/vuelos';
import { listarMantenimientos } from '../api/mantenimientos';
import { listarPilotos } from '../api/pilotos';
import { listarUAVs } from '../api/uavs';
import Layout from '../components/Layout';

const COLORES_UAV = ['#142850', '#C1121F', '#C9A227', '#02C39A', '#24406B', '#D97706'];

export default function Reportes() {
  const { data: resumen } = useQuery({ queryKey: ['reporte-resumen'], queryFn: resumenGeneral });
  const { data: porPiloto } = useQuery({ queryKey: ['reporte-piloto'], queryFn: horasPorPiloto });
  const { data: porUAV } = useQuery({ queryKey: ['reporte-uav'], queryFn: horasPorUAV });
  const { data: mantenimientos } = useQuery({ queryKey: ['reporte-mantenimiento'], queryFn: historialMantenimiento });
  const { data: vuelos } = useQuery({ queryKey: ['vuelos'], queryFn: listarVuelos });
  const { data: pilotos } = useQuery({ queryKey: ['pilotos'], queryFn: listarPilotos });
  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filtroUav, setFiltroUav] = useState('todos');
  const [filtroPiloto, setFiltroPiloto] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMision, setFiltroMision] = useState('todas');
  const [analisisGenerado, setAnalisisGenerado] = useState(false);
  const [vistaHoras, setVistaHoras] = useState('tabla');
  const [vistaMant, setVistaMant] = useState('tabla');

  const misiones = [...new Set((vuelos || []).map((v) => v.mision).filter(Boolean))];

  function limpiarFiltros() {
    setDesde(''); setHasta(''); setFiltroUav('todos'); setFiltroPiloto('todos'); setFiltroEstado('todos'); setFiltroMision('todas');
    setAnalisisGenerado(false);
  }

  const vuelosFiltrados = useMemo(() => {
    return (vuelos || []).filter((v) => {
      const fecha = new Date(v.fechaInicio);
      if (desde && fecha < new Date(desde)) return false;
      if (hasta && fecha > new Date(hasta + 'T23:59:59')) return false;
      if (filtroUav !== 'todos' && v.uavId !== filtroUav) return false;
      if (filtroPiloto !== 'todos' && v.pilotoId !== filtroPiloto) return false;
      if (filtroEstado !== 'todos' && v.estado !== filtroEstado) return false;
      if (filtroMision !== 'todas' && v.mision !== filtroMision) return false;
      return true;
    });
  }, [vuelos, desde, hasta, filtroUav, filtroPiloto, filtroEstado, filtroMision]);

  const mantenimientosFiltrados = useMemo(() => {
    return (mantenimientos || []).filter((m) => {
      const fecha = new Date(m.fecha);
      if (desde && fecha < new Date(desde)) return false;
      if (hasta && fecha > new Date(hasta + 'T23:59:59')) return false;
      if (filtroUav !== 'todos' && m.uavId !== filtroUav) return false;
      return true;
    });
  }, [mantenimientos, desde, hasta, filtroUav]);

  const tablaCruzada = useMemo(() => {
    const codigosUav = (uavs || []).map((u) => u.codigo);
    const filas = (pilotos || []).map((piloto) => {
      const fila = { pilotoId: piloto.id, nombre: piloto.nombre, porUAV: {}, totalHoras: 0 };
      (uavs || []).forEach((uav) => {
        const horas = vuelosFiltrados
          .filter((v) => v.pilotoId === piloto.id && v.uavId === uav.id)
          .reduce((acc, v) => acc + (new Date(v.fechaFin) - new Date(v.fechaInicio)) / (1000 * 60 * 60), 0);
        fila.porUAV[uav.codigo] = Math.round(horas * 10) / 10;
        fila.totalHoras += horas;
      });
      fila.totalHoras = Math.round(fila.totalHoras * 10) / 10;
      return fila;
    }).filter((f) => filtroPiloto === 'todos' || f.pilotoId === filtroPiloto);
    return { uavs: codigosUav, filas };
  }, [pilotos, uavs, vuelosFiltrados, filtroPiloto]);

  const datosGraficoHoras = tablaCruzada.filas.map((f) => ({ nombre: f.nombre, ...f.porUAV }));

  const mantPorTipo = useMemo(() => {
    const tipos = [...new Set(mantenimientosFiltrados.map((m) => m.tipo))];
    return tipos.map((tipo) => {
      const delTipo = mantenimientosFiltrados.filter((m) => m.tipo === tipo);
      return {
        tipo,
        completado: delTipo.filter((m) => m.estado === 'completado').length,
        pendiente: delTipo.filter((m) => m.estado === 'pendiente').length,
        enProceso: delTipo.filter((m) => m.estado === 'en_proceso').length,
        total: delTipo.length,
      };
    });
  }, [mantenimientosFiltrados]);

  const resumenTexto = useMemo(() => {
    const partes = [];
    if (desde || hasta) partes.push(`entre ${desde ? new Date(desde).toLocaleDateString('es-EC') : 'el inicio'} y ${hasta ? new Date(hasta).toLocaleDateString('es-EC') : 'hoy'}`);
    if (filtroUav !== 'todos') partes.push(`para el UAV ${uavs?.find((u) => u.id === filtroUav)?.codigo}`);
    if (filtroPiloto !== 'todos') partes.push(`del piloto ${pilotos?.find((p) => p.id === filtroPiloto)?.nombre}`);
    if (filtroEstado !== 'todos') partes.push(`con estado "${filtroEstado.replace('_', ' ')}"`);
    if (filtroMision !== 'todas') partes.push(`en la misión "${filtroMision}"`);

    const horasTotalesFiltro = vuelosFiltrados.reduce((acc, v) => acc + (new Date(v.fechaFin) - new Date(v.fechaInicio)) / (1000 * 60 * 60), 0);
    const descripcionFiltros = partes.length > 0 ? partes.join(', ') : 'sin filtros aplicados (todos los registros)';

    return `Se encontraron ${vuelosFiltrados.length} vuelo(s) (${horasTotalesFiltro.toFixed(1)} h en total) y ${mantenimientosFiltrados.length} mantenimiento(s), ${descripcionFiltros}.`;
  }, [vuelosFiltrados, mantenimientosFiltrados, desde, hasta, filtroUav, filtroPiloto, filtroEstado, filtroMision, uavs, pilotos]);

  const horasTotales = porPiloto?.reduce((acc, p) => acc + p.horasTotales, 0) || 0;

  const kpis = [
    { Icon: Plane, label: 'UAVs totales', valor: resumen?.totalUAVs ?? '—' },
    { Icon: ShieldCheck, label: 'UAVs operativos', valor: resumen?.uavsOperativos ?? '—' },
    { Icon: UserRound, label: 'Pilotos', valor: resumen?.totalPilotos ?? '—' },
    { Icon: ClipboardList, label: 'Vuelos registrados', valor: resumen?.totalVuelos ?? '—' },
    { Icon: Clock, label: 'Horas totales', valor: `${horasTotales.toFixed(1)} h` },
  ];

  const estadoBadge = {
    operativo: 'bg-success/10 text-success',
    en_mantenimiento: 'bg-warning/10 text-warning',
    de_baja: 'bg-slate-200 text-slate-600',
  };
  const mantEstadoBadge = { completado: 'bg-success/10 text-success', pendiente: 'bg-warning/10 text-warning', en_proceso: 'bg-navy/10 text-navy' };
  const mantEstadoTexto = { completado: 'Completado', pendiente: 'Pendiente', en_proceso: 'En proceso' };

  const selectClass = "border border-slate-300 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-navy bg-white";

  function ToggleVista({ vista, setVista }) {
    return (
      <div className="flex border border-slate-300">
        <button onClick={() => setVista('tabla')} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs ${vista === 'tabla' ? 'bg-navy-dark text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Table2 size={12} /> Tabla
        </button>
        <button onClick={() => setVista('grafico')} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs border-l border-slate-300 ${vista === 'grafico' ? 'bg-navy-dark text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
          <LineChart size={12} /> Gráfico
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <BarChart3 size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">Reportes</h1>
            <p className="text-sm text-slate-500 mt-1">Información agregada para consulta y auditoría</p>
          </div>
          <div className="flex gap-2">
            <button onClick={descargarPDF} className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition">
              <FileText size={15} /> PDF
            </button>
            <button onClick={descargarExcel} className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 transition">
              <Download size={15} /> Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.Icon size={15} className="text-navy" />
                <p className="text-2xl font-display font-semibold text-navy-dark">{k.valor}</p>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-navy-dark tracking-[0.15em] uppercase flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-accent" /> Análisis dinámico
            </p>
            <button onClick={limpiarFiltros} className="flex items-center gap-1 text-xs text-slate-500 hover:text-accent">
              <RotateCcw size={12} /> Restablecer filtros
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><Calendar size={11} /> Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={`${selectClass} w-full`} />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><Calendar size={11} /> Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={`${selectClass} w-full`} />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><Plane size={11} /> UAV</label>
              <select value={filtroUav} onChange={(e) => setFiltroUav(e.target.value)} className={`${selectClass} w-full`}>
                <option value="todos">Todos</option>
                {uavs?.map((u) => <option key={u.id} value={u.id}>{u.codigo}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><UserRound size={11} /> Piloto</label>
              <select value={filtroPiloto} onChange={(e) => setFiltroPiloto(e.target.value)} className={`${selectClass} w-full`}>
                <option value="todos">Todos</option>
                {pilotos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><Target size={11} /> Estado del vuelo</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={`${selectClass} w-full`}>
                <option value="todos">Todos</option>
                <option value="completado">Completado</option>
                <option value="finalizado">Finalizado</option>
                <option value="con_novedad">Con novedad</option>
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            {misiones.length > 0 && (
              <div className="max-w-xs flex-1">
                <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1"><Target size={11} /> Misión</label>
                <select value={filtroMision} onChange={(e) => setFiltroMision(e.target.value)} className={`${selectClass} w-full`}>
                  <option value="todas">Todas</option>
                  {misiones.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            <button
              onClick={() => setAnalisisGenerado(true)}
              className="flex items-center gap-1.5 bg-accent text-white text-sm font-medium px-4 py-2.5 hover:bg-accent-dark transition"
            >
              <Sparkles size={15} /> Generar análisis
            </button>
          </div>
        </div>

        {analisisGenerado ? (
          <>
            <div className="bg-navy-dark border border-navy-light/50 p-5 mb-6 flex items-start gap-3">
              <FileBarChart size={18} className="text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-gold tracking-[0.2em] uppercase mb-1">Resumen del análisis</p>
                <p className="text-sm text-ice">{resumenTexto}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <section className="bg-white border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-navy-dark tracking-[0.15em] uppercase flex items-center gap-2">
                    <Users2 size={15} className="text-accent" /> Horas por piloto y UAV
                  </p>
                  <ToggleVista vista={vistaHoras} setVista={setVistaHoras} />
                </div>

                {vistaHoras === 'tabla' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-dark text-white text-left">
                        <tr>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Piloto</th>
                          {tablaCruzada.uavs.map((codigo) => (
                            <th key={codigo} className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">{codigo}</th>
                          ))}
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tablaCruzada.filas.map((fila) => (
                          <tr key={fila.pilotoId}>
                            <td className="px-4 py-3 text-navy-dark font-medium">{fila.nombre}</td>
                            {tablaCruzada.uavs.map((codigo) => (
                              <td key={codigo} className="px-4 py-3 text-slate-600 text-right">{fila.porUAV[codigo]} h</td>
                            ))}
                            <td className="px-4 py-3 text-navy-dark font-semibold text-right">{fila.totalHoras} h</td>
                          </tr>
                        ))}
                        {tablaCruzada.filas.length === 0 && (
                          <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400 text-sm">Sin datos para estos filtros.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4" style={{ height: 300 }}>
                    {datosGraficoHoras.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-16">Sin datos para graficar.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datosGraficoHoras}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} unit="h" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          {tablaCruzada.uavs.map((codigo, i) => (
                            <Bar key={codigo} dataKey={codigo} fill={COLORES_UAV[i % COLORES_UAV.length]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-navy-dark tracking-[0.15em] uppercase flex items-center gap-2">
                    <Wrench size={15} className="text-accent" /> Mantenimientos por tipo y estado
                  </p>
                  <ToggleVista vista={vistaMant} setVista={setVistaMant} />
                </div>

                {vistaMant === 'tabla' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-dark text-white text-left">
                        <tr>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Tipo</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Completado</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Pendiente</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">En proceso</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mantPorTipo.map((m) => (
                          <tr key={m.tipo}>
                            <td className="px-4 py-3 text-navy-dark font-medium">{m.tipo}</td>
                            <td className="px-4 py-3 text-success text-right">{m.completado}</td>
                            <td className="px-4 py-3 text-warning text-right">{m.pendiente}</td>
                            <td className="px-4 py-3 text-navy text-right">{m.enProceso}</td>
                            <td className="px-4 py-3 text-navy-dark font-semibold text-right">{m.total}</td>
                          </tr>
                        ))}
                        {mantPorTipo.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">Sin datos para estos filtros.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4" style={{ height: 300 }}>
                    {mantPorTipo.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-16">Sin datos para graficar.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mantPorTipo}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="completado" name="Completado" fill="#02C39A" />
                          <Bar dataKey="pendiente" name="Pendiente" fill="#D97706" />
                          <Bar dataKey="enProceso" name="En proceso" fill="#142850" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 p-10 text-center mb-8">
            <Sparkles size={22} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Configura los filtros que necesites y haz clic en "Generar análisis" para ver las tablas dinámicas.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <ListChecks size={15} className="text-accent" />
              <p className="text-xs font-semibold text-navy-dark tracking-[0.15em] uppercase">Resumen general de operaciones</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-dark text-white text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Código</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Modelo</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Vuelos</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium text-right">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {porUAV?.map((u) => (
                    <tr key={u.uavId}>
                      <td className="px-4 py-3 text-navy-dark font-medium">{u.codigo}</td>
                      <td className="px-4 py-3 text-slate-600">{u.modelo}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${estadoBadge[u.estado]}`}>{u.estado.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 text-slate-600 text-right">{u.totalVuelos}</td>
                      <td className="px-4 py-3 text-slate-600 text-right">{u.horasTotales} h</td>
                    </tr>
                  ))}
                  {porUAV?.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">Sin datos aún.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <a href="#" className="flex items-center gap-1 text-xs text-accent hover:opacity-80">Ver reporte completo <ChevronRight size={13} /></a>
            </div>
          </section>

          <section className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <History size={15} className="text-accent" />
              <p className="text-xs font-semibold text-navy-dark tracking-[0.15em] uppercase">Historial de mantenimiento</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-dark text-white text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">UAV</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Fecha</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Tipo</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mantenimientos?.slice(0, 5).map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 text-navy-dark font-medium">{m.uav?.codigo}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(m.fecha).toLocaleDateString('es-EC')}</td>
                      <td className="px-4 py-3 text-slate-600">{m.tipo}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${mantEstadoBadge[m.estado]}`}>{mantEstadoTexto[m.estado]}</span></td>
                    </tr>
                  ))}
                  {mantenimientos?.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-sm">Sin mantenimientos registrados.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <a href="#" className="flex items-center gap-1 text-xs text-accent hover:opacity-80">Ver historial completo <ChevronRight size={13} /></a>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}