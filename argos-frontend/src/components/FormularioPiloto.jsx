import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listarUAVs } from '../api/uavs';

const RANGOS = ['Subteniente', 'Teniente', 'Capitán', 'Mayor', 'Teniente Coronel', 'Coronel'];
const ESPECIALIDADES = ['Comunicaciones', 'Inteligencia', 'Reconocimiento', 'Vigilancia', 'Instructor', 'Pruebas'];

export default function FormularioPiloto({ pilotoInicial, onGuardar, onCancelar, guardando }) {
  const [usuarioId, setUsuarioId] = useState(pilotoInicial?.usuarioId || '');
  const [nombre, setNombre] = useState(pilotoInicial?.nombre || '');
  const [licencia, setLicencia] = useState(pilotoInicial?.licencia || '');
  const [vencimientoLicencia, setVencimientoLicencia] = useState(
    pilotoInicial?.vencimientoLicencia ? pilotoInicial.vencimientoLicencia.slice(0, 10) : ''
  );
  const [rango, setRango] = useState(pilotoInicial?.rango || '');
  const [especialidad, setEspecialidad] = useState(pilotoInicial?.especialidad || '');
  const [uavAsignadoId, setUavAsignadoId] = useState(pilotoInicial?.uavAsignadoId || '');
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ usuarioId, nombre, licencia, vencimientoLicencia, rango, especialidad, uavAsignadoId }, archivo);
  }

  const inputClass = "w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 space-y-4">
      <h3 className="font-display font-semibold text-navy-dark">{pilotoInicial ? 'Editar Piloto' : 'Nuevo Piloto'}</h3>

      {!pilotoInicial && (
        <div>
          <label className={labelClass}>ID de usuario (rol piloto)</label>
          <input type="text" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} required className={inputClass} placeholder="Pega aquí el id del usuario" />
        </div>
      )}

      <div>
        <label className={labelClass}>Nombre</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClass} placeholder="Juan Pérez" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Rango</label>
          <select value={rango} onChange={(e) => setRango(e.target.value)} className={inputClass}>
            <option value="">Selecciona un rango</option>
            {RANGOS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Especialidad</label>
          <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className={inputClass}>
            <option value="">Selecciona una especialidad</option>
            {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Licencia</label>
        <input type="text" value={licencia} onChange={(e) => setLicencia(e.target.value)} required className={inputClass} placeholder="LIC-UAV-2024-001" />
      </div>

      <div>
        <label className={labelClass}>Vencimiento de licencia</label>
        <input type="date" value={vencimientoLicencia} onChange={(e) => setVencimientoLicencia(e.target.value)} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>UAV asignado</label>
        <select value={uavAsignadoId} onChange={(e) => setUavAsignadoId(e.target.value)} className={inputClass}>
          <option value="">Sin asignar</option>
          {uavs?.map((u) => <option key={u.id} value={u.id}>{u.codigo} — {u.modelo}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Foto</label>
        <div className="flex items-center gap-3">
          {previewFoto && <img src={previewFoto} alt="Vista previa" className="w-16 h-16 rounded-full object-cover border border-slate-200" />}
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 transition text-slate-700 text-sm font-medium px-4 py-2 border border-slate-300">
            {archivo ? 'Cambiar imagen' : 'Seleccionar imagen'}
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              setArchivo(file);
              if (file) setPreviewFoto(URL.createObjectURL(file));
            }} className="hidden" />
          </label>
          {archivo && <span className="text-xs text-slate-500 truncate max-w-[120px]">{archivo.name}</span>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={guardando} className="bg-navy-dark text-white font-medium px-4 py-2 hover:bg-navy transition disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="text-slate-600 hover:text-slate-900 transition px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}