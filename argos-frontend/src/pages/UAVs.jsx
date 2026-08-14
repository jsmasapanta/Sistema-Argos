import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listarUAVs, crearUAV, actualizarUAV, subirFotoUAV } from '../api/uavs';
import { urlFoto } from '../api/config';
import FormularioUAV from '../components/FormularioUAV';

export default function UAVs() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [uavEditando, setUavEditando] = useState(null);
  const queryClient = useQueryClient();

  const { data: uavs, isLoading, isError } = useQuery({
    queryKey: ['uavs'],
    queryFn: listarUAVs,
  });

  const mutation = useMutation({
    mutationFn: async ({ datos, archivo, id }) => {
      const uav = id ? await actualizarUAV(id, datos) : await crearUAV(datos);
      if (archivo) {
        await subirFotoUAV(uav.id, archivo);
      }
      return uav;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setMostrarForm(false);
      setUavEditando(null);
    },
  });

  function handleGuardar(datos, archivo) {
    mutation.mutate({ datos, archivo, id: uavEditando?.id });
  }

  function abrirEdicion(uav) {
    setUavEditando(uav);
    setMostrarForm(true);
  }

  function abrirNuevo() {
    setUavEditando(null);
    setMostrarForm(true);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
          <h1 className="text-2xl font-bold text-slate-900">UAVs</h1>
        </div>
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nuevo UAV
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
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

        {isLoading && <p className="text-slate-500">Cargando UAVs...</p>}
        {isError && <p className="text-red-600">Error al cargar los UAVs.</p>}

        {uavs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {uavs.map((uav) => (
              <div
                key={uav.id}
                onClick={() => abrirEdicion(uav)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
              >
                <div className="h-40 bg-slate-200 flex items-center justify-center">
                  {uav.fotoUrl ? (
                    <img src={urlFoto(uav.fotoUrl)} alt={uav.codigo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-sm">Sin foto</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900">{uav.codigo}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        uav.estado === 'operativo'
                          ? 'bg-green-100 text-green-700'
                          : uav.estado === 'en_mantenimiento'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {uav.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{uav.modelo}</p>
                  <p className="text-xs text-slate-400 mt-2">{uav.horasTotales} h totales</p>
                </div>
              </div>
            ))}

            {uavs.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10">Aún no hay UAVs registrados.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}