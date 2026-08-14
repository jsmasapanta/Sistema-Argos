import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarPilotos } from '../api/pilotos';
import { listarUAVs } from '../api/uavs';

export default function FormularioVuelo({ onGuardar, onCancelar, guardando }) {
  const [pilotoId, setPilotoId] = useState('');
  const [uavId, setUavId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [novedades, setNovedades] = useState('');

  const { data: pilotos } = useQuery({ queryKey: ['pilotos'], queryFn: listarPilotos });
  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({
      pilotoId,
      uavId,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
      novedades,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Nuevo Vuelo</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Piloto</label>
        <select
          value={pilotoId}
          onChange={(e) => setPilotoId(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">Selecciona un piloto</option>
          {pilotos?.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">UAV</label>
        <select
          value={uavId}
          onChange={(e) => setUavId(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">Selecciona un UAV</option>
          {uavs?.map((u) => (
            <option key={u.id} value={u.id}>{u.codigo} — {u.modelo}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Inicio</label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Novedades (opcional)</label>
        <textarea
          value={novedades}
          onChange={(e) => setNovedades(e.target.value)}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Sin novedades"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-slate-900 text-white font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Registrar vuelo'}
        </button>
        <button type="button" onClick={onCancelar} className="text-slate-600 hover:text-slate-900 transition px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}