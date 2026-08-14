import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { misVuelos } from '../api/vuelos';

export default function MisVuelos() {
  const { data: vuelos, isLoading, isError } = useQuery({
    queryKey: ['mis-vuelos'],
    queryFn: misVuelos,
  });

  function calcularHoras(inicio, fin) {
    const horas = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60);
    return horas.toFixed(1);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
        <h1 className="text-2xl font-bold text-slate-900">Mis Vuelos</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isLoading && <p className="text-slate-500">Cargando tus vuelos...</p>}
        {isError && <p className="text-red-600">Error al cargar tus vuelos.</p>}

        {vuelos && (
          <div className="space-y-3">
            {vuelos.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">{v.uav?.codigo}</span>
                  <span className="text-sm text-slate-500">{calcularHoras(v.fechaInicio, v.fechaFin)} h</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(v.fechaInicio).toLocaleString('es-EC')} — {new Date(v.fechaFin).toLocaleString('es-EC')}
                </p>
                {v.novedades && <p className="text-sm text-slate-400 mt-1">{v.novedades}</p>}
              </div>
            ))}

            {vuelos.length === 0 && (
              <p className="text-slate-400 text-center py-10">Aún no tienes vuelos registrados.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}