import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Pencil, Plus } from 'lucide-react';
import { misVuelos, crearVuelo, actualizarVuelo } from '../api/vuelos';
import { subirFotoPiloto } from '../api/pilotos';
import apiClient from '../api/client';
import { estadoLicencia } from '../api/utils';
import { urlFoto } from '../api/config';
import Layout from '../components/Layout';
import ToastExito from '../components/ToastExito';
import FormularioMiVuelo from '../components/FormularioMiVuelo';
import UAVsDisponibles from '../components/UAVsDisponibles';

async function obtenerMiPerfil() {
  const { data } = await apiClient.get('/pilotos/mi-perfil');
  return data;
}

export default function MisVuelos() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoNovedades, setEditandoNovedades] = useState(null);
  const [textoNovedades, setTextoNovedades] = useState('');

  const { data: vuelos, isLoading, isError } = useQuery({
    queryKey: ['mis-vuelos'],
    queryFn: misVuelos,
  });

  const { data: miPerfil } = useQuery({
    queryKey: ['mi-perfil'],
    queryFn: obtenerMiPerfil,
  });

  const fotoMutation = useMutation({
    mutationFn: (archivo) => subirFotoPiloto(miPerfil.id, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mi-perfil'] });
      setToast('Foto actualizada');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const crearMutation = useMutation({
    mutationFn: crearVuelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-vuelos'] });
      queryClient.invalidateQueries({ queryKey: ['uavs'] });
      setMostrarForm(false);
      setToast('Vuelo registrado correctamente');
      setTimeout(() => setToast(''), 3000);
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, novedades }) => actualizarVuelo(id, { novedades }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-vuelos'] });
      setEditandoNovedades(null);
      setToast('Novedades actualizadas');
      setTimeout(() => setToast(''), 3000);
    },
  });

  function handleCambiarFoto(e) {
    const archivo = e.target.files[0];
    if (archivo) fotoMutation.mutate(archivo);
  }

  function iniciarEdicion(vuelo) {
    setEditandoNovedades(vuelo.id);
    setTextoNovedades(vuelo.novedades || '');
  }

  function calcularHoras(inicio, fin) {
    const horas = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60);
    return horas.toFixed(1);
  }

  const totalHoras = vuelos?.reduce((acc, v) => acc + parseFloat(calcularHoras(v.fechaInicio, v.fechaFin)), 0) || 0;
  const estadoLic = miPerfil ? estadoLicencia(miPerfil.vencimientoLicencia) : null;

  return (
    <Layout>
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <ClipboardList size={13} /> Módulo
            </p>
            <h1 className="font-display font-semibold text-3xl text-navy-dark">Mis Vuelos</h1>
            <p className="text-sm text-slate-500 mt-1">Tu historial de vuelos registrado</p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 bg-navy-dark text-white text-sm font-medium px-4 py-2.5 hover:bg-navy transition"
          >
            <Plus size={16} /> Registrar vuelo
          </button>
        </div>

        {crearMutation.isError && (
          <div className="mb-4 max-w-lg bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-3">
            {crearMutation.error?.response?.data?.error || 'Error al registrar el vuelo.'}
          </div>
        )}

        {mostrarForm && miPerfil && (
          <div className="mb-6 max-w-lg">
            <FormularioMiVuelo
              pilotoId={miPerfil.id}
              onGuardar={(datos) => crearMutation.mutate(datos)}
              onCancelar={() => setMostrarForm(false)}
              guardando={crearMutation.isPending}
            />
          </div>
        )}

        {estadoLic && estadoLic.nivel !== 'vigente' && (
          <div
            className={`mb-6 px-4 py-3 text-sm font-medium ${
              estadoLic.nivel === 'vencida' ? 'bg-accent/10 border border-accent/30 text-accent' : 'bg-warning/10 border border-warning/30 text-warning'
            }`}
          >
            ⚠ Tu licencia {estadoLic.nivel === 'vencida' ? 'está vencida' : `vence en ${estadoLic.dias} día(s)`} — contacta a un administrador.
          </div>
        )}

        {miPerfil && (
          <div className="bg-white border border-slate-200 p-5 mb-6 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {miPerfil.fotoUrl ? (
                  <img src={urlFoto(miPerfil.fotoUrl)} alt={miPerfil.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">Sin foto</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-navy-dark text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-navy transition">
                <Pencil size={11} />
                <input type="file" accept="image/*" onChange={handleCambiarFoto} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-display font-semibold text-navy-dark">{miPerfil.nombre}</p>
              <p className="text-sm text-slate-500">{miPerfil.licencia}</p>
            </div>
            <div className="ml-auto flex gap-8">
              <div>
                <p className="text-2xl font-display font-semibold text-navy-dark">{totalHoras.toFixed(1)} h</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Horas totales</p>
              </div>
              <div>
                <p className="text-2xl font-display font-semibold text-navy-dark">{vuelos?.length || 0}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Vuelos</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading && <p className="text-slate-500 text-sm">Cargando tus vuelos...</p>}
            {isError && <p className="text-accent text-sm">Error al cargar tus vuelos.</p>}

            {vuelos && (
              <div className="space-y-3">
                {vuelos.map((v) => (
                  <div key={v.id} className="bg-white border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <span className="font-display font-semibold text-navy-dark">{v.uav?.codigo}</span>
                      <span className="text-sm text-slate-500">{calcularHoras(v.fechaInicio, v.fechaFin)} h</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(v.fechaInicio).toLocaleString('es-EC')} — {new Date(v.fechaFin).toLocaleString('es-EC')}
                    </p>

                    {editandoNovedades === v.id ? (
                      <div className="flex gap-2 items-center mt-2">
                        <input
                          type="text"
                          value={textoNovedades}
                          onChange={(e) => setTextoNovedades(e.target.value)}
                          className="border border-slate-300 px-2 py-1 text-sm flex-1"
                          autoFocus
                        />
                        <button onClick={() => editarMutation.mutate({ id: v.id, novedades: textoNovedades })} className="text-success text-xs font-semibold uppercase">
                          Guardar
                        </button>
                        <button onClick={() => setEditandoNovedades(null)} className="text-slate-400 text-xs">Cancelar</button>
                      </div>
                    ) : (
                      <p
                        onClick={() => iniciarEdicion(v)}
                        className="text-sm text-slate-400 mt-1 cursor-pointer hover:text-navy-dark hover:underline"
                      >
                        {v.novedades || 'Agregar novedad...'}
                      </p>
                    )}
                  </div>
                ))}
                {vuelos.length === 0 && (
                  <p className="text-slate-400 text-center py-10 text-sm">Aún no tienes vuelos registrados.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <UAVsDisponibles />
          </div>
        </div>

        <ToastExito mensaje={toast} visible={!!toast} />
      </div>
    </Layout>
  );
}