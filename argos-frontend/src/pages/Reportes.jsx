import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { resumenGeneral, horasPorPiloto, horasPorUAV, historialMantenimiento, descargarPDF, descargarExcel } from '../api/reportes';
import Layout from '../components/Layout';

export default function Reportes() {
  const { data: resumen } = useQuery({ queryKey: ['reporte-resumen'], queryFn: resumenGeneral });
  const { data: porPiloto } = useQuery({ queryKey: ['reporte-piloto'], queryFn: horasPorPiloto });
  const { data: porUAV } = useQuery({ queryKey: ['reporte-uav'], queryFn: horasPorUAV });
  const { data: mantenimientos } = useQuery({ queryKey: ['reporte-mantenimiento'], queryFn: historialMantenimiento });

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
            <button
              onClick={descargarPDF}
              className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
            >
              <Download size={15} /> PDF
            </button>
            <button
              onClick={descargarExcel}
              className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 transition"
            >
              <Download size={15} /> Excel
            </button>
          </div>
        </div>

        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { l: 'UAVs totales', v: resumen.totalUAVs },
              { l: 'UAVs operativos', v: resumen.uavsOperativos },
              { l: 'Pilotos', v: resumen.totalPilotos },
              { l: 'Vuelos registrados', v: resumen.totalVuelos },
            ].map((s) => (
              <div key={s.l} className="bg-white border border-slate-200 p-4">
                <p className="text-3xl font-display font-semibold text-navy-dark">{s.v}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-navy-dark uppercase tracking-wide mb-3">Horas por piloto</h2>
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Piloto</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Vuelos</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Horas totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porPiloto?.map((p) => (
                  <tr key={p.pilotoId}>
                    <td className="px-4 py-3 text-navy-dark font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{p.totalVuelos}</td>
                    <td className="px-4 py-3 text-slate-600">{p.horasTotales} h</td>
                  </tr>
                ))}
                {porPiloto?.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Sin datos aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-navy-dark uppercase tracking-wide mb-3">Horas por UAV</h2>
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Código</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Modelo</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Estado</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Vuelos</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Horas totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porUAV?.map((u) => (
                  <tr key={u.uavId}>
                    <td className="px-4 py-3 text-navy-dark font-medium">{u.codigo}</td>
                    <td className="px-4 py-3 text-slate-600">{u.modelo}</td>
                    <td className="px-4 py-3 text-slate-600">{u.estado}</td>
                    <td className="px-4 py-3 text-slate-600">{u.totalVuelos}</td>
                    <td className="px-4 py-3 text-slate-600">{u.horasTotales} h</td>
                  </tr>
                ))}
                {porUAV?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Sin datos aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-navy-dark uppercase tracking-wide mb-3">Historial de mantenimiento</h2>
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">UAV</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Fecha</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Tipo</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mantenimientos?.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-navy-dark font-medium">{m.uav?.codigo}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(m.fecha).toLocaleDateString('es-EC')}</td>
                    <td className="px-4 py-3 text-slate-600">{m.tipo}</td>
                    <td className="px-4 py-3 text-slate-500">{m.descripcion || '—'}</td>
                  </tr>
                ))}
                {mantenimientos?.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Sin mantenimientos registrados aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}