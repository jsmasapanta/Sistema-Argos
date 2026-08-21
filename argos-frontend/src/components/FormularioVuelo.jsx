import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarPilotos } from '../api/pilotos';
import { listarUAVs } from '../api/uavs';

export default function FormularioVuelo({ onGuardar, onCancelar, guardando }) {
  const [pilotoId, setPilotoId] = useState('');
  const [uavId, setUavId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mision, setMision] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [areaSector, setAreaSector] = useState('');
  const [condicionesClimaticas, setCondicionesClimaticas] = useState('');
  const [bateriaUtilizada, setBateriaUtilizada] = useState('');
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
      mision, objetivo, areaSector, condicionesClimaticas, bateriaUtilizada, novedades,
    });
  }

  const inputClass = "w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 space-y-4">
      <h3 className="font-display font-semibold text-navy-dark">Registrar vuelo</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Piloto</label>
          <select value={pilotoId} onChange={(e) => setPilotoId(e.target.value)} required className={inputClass}>
            <option value="">Selecciona un piloto</option>
            {pilotos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>UAV</label>
          <select value={uavId} onChange={(e) => setUavId(e.target.value)} required className={inputClass}>
            <option value="">Selecciona un UAV</option>
            {uavs?.map((u) => <option key={u.id} value={u.id}>{u.codigo} — {u.modelo}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Misión</label>
        <input type="text" value={mision} onChange={(e) => setMision(e.target.value)} className={inputClass} placeholder="Reconocimiento de zona" />
      </div>

      <div>
        <label className={labelClass}>Objetivo</label>
        <textarea value={objetivo} onChange={(e) => setObjetivo(e.target.value)} rows={2} className={inputClass} placeholder="Levantamiento fotogramétrico del sector..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Inicio</label>
          <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fin</label>
          <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Área / Sector</label>
          <input type="text" value={areaSector} onChange={(e) => setAreaSector(e.target.value)} className={inputClass} placeholder="Sector Norte – Zona 7" />
        </div>
        <div>
          <label className={labelClass}>Batería utilizada (%)</label>
          <input type="number" min="0" max="100" value={bateriaUtilizada} onChange={(e) => setBateriaUtilizada(e.target.value)} className={inputClass} placeholder="78" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Condiciones climáticas</label>
        <input type="text" value={condicionesClimaticas} onChange={(e) => setCondicionesClimaticas(e.target.value)} className={inputClass} placeholder="Parcialmente nublado, 24°C, 8 km/h NE" />
      </div>

      <div>
        <label className={labelClass}>Novedades / Observaciones</label>
        <textarea value={novedades} onChange={(e) => setNovedades(e.target.value)} rows={2} className={inputClass} placeholder="Sin novedades" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={guardando} className="bg-navy-dark text-white font-medium px-4 py-2 hover:bg-navy transition disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Registrar vuelo'}
        </button>
        <button type="button" onClick={onCancelar} className="text-slate-600 hover:text-slate-900 transition px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}