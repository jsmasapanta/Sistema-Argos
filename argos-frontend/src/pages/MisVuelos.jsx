import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { misVuelos } from '../api/vuelos';
import { subirFotoPiloto } from '../api/pilotos';
import apiClient from '../api/client';
import { estadoLicencia } from '../api/utils';
import { urlFoto } from '../api/config';
import ToastExito from '../components/ToastExito';

async function obtenerMiPerfil() {
  const { data } = await apiClient.get('/pilotos/mi-perfil');
  return data;
}

export default function MisVuelos() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');

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

  function handleCambiarFoto(e) {
    const archivo = e.target.files[0];
    if (archivo) {
      fotoMutation.mutate(archivo);
    }
  }

  function calcularHoras(inicio, fin) {
    const horas = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60);
    return horas.toFixed(1);
  }

  const totalHoras = vuelos?.reduce((acc, v) => acc + parseFloat(calcularHoras(v.fechaInicio, v.fechaFin)), 0) || 0;
  const estadoLic = miPerfil ? estadoLicencia(miPerfil.vencimientoLicencia) : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <Link to="/" className="text-sm text-slate-500 hover:text-red-700">← Inicio</Link>
        <h1 className="text-2xl font-bold text-slate-900">Mis Vuelos</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {estadoLic && estadoLic.nivel !== 'vigente' && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
              estadoLic.nivel === 'vencida'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`}
          >
            ⚠ Tu licencia {estadoLic.nivel === 'vencida' ? 'está vencida' : `vence en ${estadoLic.dias} día(s)`} — contacta a un administrador para renovarla.
          </div>
        )}

        {miPerfil && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {miPerfil.fotoUrl ? (
                  <img src={urlFoto(miPerfil.fotoUrl)} alt={miPerfil.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">Sin foto</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                ✎
                <input type="file" accept="image/*" onChange={handleCambiarFoto} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{miPerfil.nombre}</p>
              <p className="text-sm text-slate-500">{miPerfil.licencia}</p>
            </div>
            <div className="ml-auto flex gap-6">
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalHoras.toFixed(1)} h</p>
                <p className="text-sm text-slate-500">Horas totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vuelos?.length || 0}</p>
                <p className="text-sm text-slate-500">Vuelos</p>
              </div>
            </div>
          </div>
        )}

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

        <ToastExito mensaje={toast} visible={!!toast} />
      </main>
    </div>
  );
}