import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus } from 'lucide-react';
import { listarPilotos, crearPiloto, actualizarPiloto, eliminarPiloto, subirFotoPiloto } from '../api/pilotos';
import { urlFoto } from '../api/config';
import { estadoLicencia } from '../api/utils';
import Layout from '../components/Layout';
import FormularioPiloto from '../components/FormularioPiloto';
import ConfirmarAccion from '../components/ConfirmarAccion';
import ToastExito from '../components/ToastExito';

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
            <FormularioPiloto
              pilotoInicial={pilotoEditando}
              onGuardar={handleGuardar}
              onCancelar={() => setMostrarForm(false)}
              guardando={mutation.isPending}
            />
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o licencia..."
            className="w-full max-w-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        {isLoading && <p className="text-slate-500 text-sm">Cargando pilotos...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los pilotos.</p>}

        {pilotos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pilotosFiltrados.map((piloto) => (
              <div key={piloto.id} className="bg-white border border-slate-200 p-5 flex items-center gap-4">
                <div
                  onClick={() => abrirEdicion(piloto)}
                  className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  {piloto.fotoUrl ? (
                    <img src={urlFoto(piloto.fotoUrl)} alt={piloto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-[10px]">Sin foto</span>
                  )}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => abrirEdicion(piloto)}>
                  <h3 className="font-display font-semibold text-navy-dark">{piloto.nombre}</h3>
                  <p className="text-sm text-slate-500">{piloto.licencia}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vence: {new Date(piloto.vencimientoLicencia).toLocaleDateString('es-EC')}
                  </p>
                  {(() => {
                    const estado = estadoLicencia(piloto.vencimientoLicencia);
                    if (estado.nivel === 'vigente') return null;
                    return (
                      <span
                        className={`inline-block mt-1 text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${
                          estado.nivel === 'vencida' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {estado.texto}
                      </span>
                    );
                  })()}
                  <p className="text-[11px] text-slate-300 mt-2">
                    {piloto.creadoPor ? `Creado por ${piloto.creadoPor.email}` : 'Creador no registrado'} · {new Date(piloto.creadoEn).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <button
                  onClick={() => setPilotoParaEliminar(piloto)}
                  className="text-xs text-slate-400 hover:text-accent transition self-start"
                >
                  Eliminar
                </button>
              </div>
            ))}

            {pilotosFiltrados.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10 text-sm">
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
      </div>
    </Layout>
  );
}