import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';
import { listarVuelos, crearVuelo, actualizarVuelo } from '../api/vuelos';
import Layout from '../components/Layout';
import FormularioVuelo from '../components/FormularioVuelo';

export default function Vuelos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoNovedades, setEditandoNovedades] = useState(null);
  const [textoNovedades, setTextoNovedades] = useState('');
  const queryClient = useQueryClient();

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

  function calcularHoras(inicio, fin) {
    const horas = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60);
    return horas.toFixed(1);
  }

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

        {mutation.isError && (
          <div className="mb-4 bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
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

        {isLoading && <p className="text-slate-500 text-sm">Cargando vuelos...</p>}
        {isError && <p className="text-accent text-sm">Error al cargar los vuelos.</p>}

        {vuelos && (
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark text-white text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Piloto</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">UAV</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Inicio</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Fin</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Horas</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Novedades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vuelos.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 text-navy-dark font-medium">{v.piloto?.nombre}</td>
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
                            className="border border-slate-300 px-2 py-1 text-sm flex-1"
                            autoFocus
                          />
                          <button
                            onClick={() => actualizarMutation.mutate({ id: v.id, novedades: textoNovedades })}
                            className="text-success text-xs font-semibold uppercase"
                          >
                            Guardar
                          </button>
                          <button onClick={() => setEditandoNovedades(null)} className="text-slate-400 text-xs">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span onClick={() => iniciarEdicion(v)} className="cursor-pointer hover:text-navy-dark hover:underline">
                          {v.novedades || 'Agregar novedad...'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vuelos.length === 0 && (
              <p className="text-slate-400 text-center py-10 text-sm">Aún no hay vuelos registrados.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}