import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarUAVs } from '../api/uavs';
import SelectorMapa from './SelectorMapa';

export default function FormularioMiVuelo({ pilotoId, onGuardar, onCancelar, guardando }) {
  const [uavId, setUavId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [novedades, setNovedades] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });
  const uavsDisponibles = uavs?.filter((u) => u.estado === 'operativo') || [];

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({
      pilotoId,
      uavId,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
      ubicacion, latitud, longitud, novedades,
    }, archivo);
  }

  const inputClass = "w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 space-y-4">
      <h3 className="font-display font-semibold text-navy-dark">Registrar mi vuelo</h3>

      <div>
        <label className={labelClass}>UAV utilizado</label>
        <select value={uavId} onChange={(e) => setUavId(e.target.value)} required className={inputClass}>
          <option value="">Selecciona un UAV operativo</option>
          {uavsDisponibles.map((u) => <option key={u.id} value={u.id}>{u.codigo} — {u.modelo}</option>)}
        </select>
        {uavsDisponibles.length === 0 && (
          <p className="text-xs text-warning mt-1">No hay UAVs operativos disponibles en este momento.</p>
        )}
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

      <div>
        <label className={labelClass}>Lugar / Sector (texto)</label>
        <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={inputClass} placeholder="Sector Norte – Zona 7" />
      </div>

      <div>
        <label className={labelClass}>Ubicación en el mapa</label>
        <SelectorMapa latitud={latitud} longitud={longitud} onCambiar={(lat, lng) => { setLatitud(lat); setLongitud(lng); }} />
      </div>

      <div>
        <label className={labelClass}>Novedades (opcional)</label>
        <textarea value={novedades} onChange={(e) => setNovedades(e.target.value)} rows={2} className={inputClass} placeholder="Sin novedades" />
      </div>

      <div>
        <label className={labelClass}>Foto del vuelo (opcional)</label>
        <div className="flex items-center gap-3">
          {previewFoto && <img src={previewFoto} alt="Vista previa" className="w-16 h-16 object-cover border border-slate-200" />}
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 transition text-slate-700 text-sm font-medium px-4 py-2 border border-slate-300">
            {archivo ? 'Cambiar imagen' : 'Seleccionar imagen'}
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              setArchivo(file);
              if (file) setPreviewFoto(URL.createObjectURL(file));
            }} className="hidden" />
          </label>
        </div>
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