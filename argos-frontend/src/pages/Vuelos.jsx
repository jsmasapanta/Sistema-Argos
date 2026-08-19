import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listarVuelos, crearVuelo, actualizarVuelo } from '../api/vuelos';
import FormularioVuelo from '../components/FormularioVuelo';

export default function Vuelos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const queryClient = useQueryClient();
  const [editandoNovedades, setEditandoNovedades] = useState(null);
  const [textoNovedades, setTextoNovedades] = useState('');


  const { data: vuelos, isLoading, isError } = useQuery({
    queryKey: ['vuelos'],
    queryFn: listarVuelos,
  });

  const mutation = useMutation({
    mutationFn: crearVuelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vuelos'] });
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setMostrarForm(false);
    },
  });

    const actualizarMutation = useMutation({
    mutationFn: ({ id, novedades }) => actualizarVuelo(id, { novedades }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vuelos'] });
      setEditandoNovedades(null);
    },
  });

  function iniciarEdicion(vuelo) {
    setEditandoNovedades(vuelo.id);
    setTextoNovedades(vuelo.novedades || '');
  }

  function guardarNovedades(id) {
    actualizarMutation.mutate({ id, novedades: textoNovedades });
  }

  function calcularHoras(inicio, fin) {
    const horas = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60);
    return horas.toFixed(1);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
          <h1 className="text-2xl font-bold text-slate-900">Bitácora de Vuelos</h1>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition"
        >
          + Registrar vuelo
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {mutation.isError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {mutation.error?.response?.data?.error || 'Error al registrar el vuelo.'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-lg">
            <FormularioVuelo
              onGuardar={(datos) => mutation.mutate(datos)}
              onCancelar={() => setMostrarForm(false)}
              guardando={mutation.isPending}
            />
          </div>
        )}

        {isLoading && <p className="text-slate-500">Cargando vuelos...</p>}
        {isError && <p className="text-red-600">Error al cargar los vuelos.</p>}

        {vuelos && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Piloto</th>
                  <th className="px-4 py-3 font-medium">UAV</th>
                  <th className="px-4 py-3 font-medium">Inicio</th>
                  <th className="px-4 py-3 font-medium">Fin</th>
                  <th className="px-4 py-3 font-medium">Horas</th>
                  <th className="px-4 py-3 font-medium">Novedades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vuelos.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 text-slate-900">{v.piloto?.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{v.uav?.codigo}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(v.fechaInicio).toLocaleString('es-EC')}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(v.fechaFin).toLocaleString('es-EC')}</td>
                    <td className="px-4 py-3 text-slate-600">{calcularHoras(v.fechaInicio, v.fechaFin)} h</td>
                    <td className="px-4 py-3 text-slate-500">
                      {editandoNovedades === v.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={textoNovedades}
                            onChange={(e) => setTextoNovedades(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-sm flex-1"
                            autoFocus
                          />
                          <button
                            onClick={() => guardarNovedades(v.id)}
                            className="text-green-700 hover:text-green-800 text-xs font-medium"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoNovedades(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => iniciarEdicion(v)}
                          className="cursor-pointer hover:text-slate-900 hover:underline"
                        >
                          {v.novedades || 'Agregar novedad...'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {vuelos.length === 0 && (
              <p className="text-slate-400 text-center py-10">Aún no hay vuelos registrados.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}