import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { resumenGeneral, horasPorPiloto, horasPorUAV, historialMantenimiento } from '../api/reportes';

export default function Reportes() {
  const { data: resumen } = useQuery({ queryKey: ['reporte-resumen'], queryFn: resumenGeneral });
  const { data: porPiloto } = useQuery({ queryKey: ['reporte-piloto'], queryFn: horasPorPiloto });
  const { data: porUAV } = useQuery({ queryKey: ['reporte-uav'], queryFn: horasPorUAV });
  const { data: mantenimientos } = useQuery({ queryKey: ['reporte-mantenimiento'], queryFn: historialMantenimiento });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Resumen general */}
        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TarjetaStat titulo="UAVs totales" valor={resumen.totalUAVs} />
            <TarjetaStat titulo="UAVs operativos" valor={resumen.uavsOperativos} />
            <TarjetaStat titulo="Pilotos" valor={resumen.totalPilotos} />
            <TarjetaStat titulo="Vuelos registrados" valor={resumen.totalVuelos} />
          </div>
        )}

        {/* Horas por piloto */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Horas por piloto</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Piloto</th>
                  <th className="px-4 py-3 font-medium">Vuelos</th>
                  <th className="px-4 py-3 font-medium">Horas totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porPiloto?.map((p) => (
                  <tr key={p.pilotoId}>
                    <td className="px-4 py-3 text-slate-900">{p.nombre}</td>
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

        {/* Horas por UAV */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Horas por UAV</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Modelo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Vuelos</th>
                  <th className="px-4 py-3 font-medium">Horas totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porUAV?.map((u) => (
                  <tr key={u.uavId}>
                    <td className="px-4 py-3 text-slate-900">{u.codigo}</td>
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

        {/* Historial de mantenimiento */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Historial de mantenimiento</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">UAV</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mantenimientos?.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-slate-900">{m.uav?.codigo}</td>
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
      </main>
    </div>
  );
}

function TarjetaStat({ titulo, valor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-2xl font-bold text-slate-900">{valor}</p>
      <p className="text-sm text-slate-500 mt-1">{titulo}</p>
    </div>
  );
}