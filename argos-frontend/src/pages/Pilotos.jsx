import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listarPilotos, crearPiloto, actualizarPiloto, eliminarPiloto, subirFotoPiloto } from '../api/pilotos';
import { urlFoto } from '../api/config';
import FormularioPiloto from '../components/FormularioPiloto';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';
import { estadoLicencia } from '../api/utils';

export default function Pilotos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pilotoEditando, setPilotoEditando] = useState(null);
  const [pilotoParaEliminar, setPilotoParaEliminar] = useState(null);
  const [toast, setToast] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const queryClient = useQueryClient();

  const { data: pilotos, isLoading, isError } = useQuery({
    queryKey: ['pilotos'],
    queryFn: listarPilotos,
  });

  const pilotosFiltrados = pilotos?.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.licencia.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async ({ datos, archivo, id }) => {
      const piloto = id ? await actualizarPiloto(id, datos) : await crearPiloto(datos);
      if (archivo) {
        await subirFotoPiloto(piloto.id, archivo);
      }
      return piloto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilotos'] });
      setMostrarForm(false);
      setPilotoEditando(null);
      setToast('Piloto guardado correctamente');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (error) => {
      console.error('Error al guardar piloto:', error);
    },
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

  function abrirNuevo() {
    setPilotoEditando(null);
    setMostrarForm(true);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
          <h1 className="text-2xl font-bold text-slate-900">Pilotos</h1>
        </div>
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nuevo Piloto
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {mutation.isError && (
          <div className="mb-4 max-w-md bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {mutation.error?.response?.data?.error || 'Ocurrió un error al guardar. Revisa la consola (F12) para más detalles.'}
          </div>
        )}

        {mostrarForm && (
          <div className="mb-6 max-w-md">
            <FormularioPiloto
              pilotoInicial={pilotoEditando}
              onGuardar={handleGuardar}
              onCancelar={() => setMostrarForm(false)}
              guardando={mutation.isPending}
            />
          </div>
        )}

        <div className="mb-5">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o licencia..."
            className="w-full max-w-sm border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {isLoading && <p className="text-slate-500">Cargando pilotos...</p>}
        {isError && <p className="text-red-600">Error al cargar los pilotos.</p>}

        {pilotos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pilotosFiltrados.map((piloto) => (
              <div
                key={piloto.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
              >
                <div
                  onClick={() => abrirEdicion(piloto)}
                  className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  {piloto.fotoUrl ? (
                    <img src={urlFoto(piloto.fotoUrl)} alt={piloto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">Sin foto</span>
                  )}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => abrirEdicion(piloto)}>
                  <h3 className="font-semibold text-slate-900">{piloto.nombre}</h3>
                  <p className="text-sm text-slate-500">{piloto.licencia}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vence: {new Date(piloto.vencimientoLicencia).toLocaleDateString('es-EC')}
                  </p>
                  {(() => {
                    const estado = estadoLicencia(piloto.vencimientoLicencia);
                    if (estado.nivel === 'vigente') return null;
                    return (
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          estado.nivel === 'vencida' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        ⚠ {estado.texto}
                      </span>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setPilotoParaEliminar(piloto)}
                  className="text-sm text-slate-400 hover:text-red-700 transition self-start"
                >
                  Eliminar
                </button>
              </div>
            ))}

            {pilotosFiltrados.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10">
                {busqueda ? 'Ningún piloto coincide con la búsqueda.' : 'Aún no hay pilotos registrados.'}
              </p>
            )}
          </div>
        )}

        {pilotoParaEliminar && (
          <ConfirmarAccion
            mensaje={`¿Eliminar a ${pilotoParaEliminar.nombre}? Esta acción no se puede deshacer.`}
            onConfirmar={() => eliminarMutation.mutate(pilotoParaEliminar.id)}
            onCancelar={() => setPilotoParaEliminar(null)}
          />
        )}

        <ToastExito mensaje={toast} visible={!!toast} />
      </main>
    </div>
  );
}