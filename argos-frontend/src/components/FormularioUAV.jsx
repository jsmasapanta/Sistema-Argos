import { useState } from 'react';

export default function FormularioUAV({ uavInicial, onGuardar, onCancelar, guardando }) {
  const [codigo, setCodigo] = useState(uavInicial?.codigo || '');
  const [modelo, setModelo] = useState(uavInicial?.modelo || '');
  const [estado, setEstado] = useState(uavInicial?.estado || 'operativo');
  const [pesoMaximo, setPesoMaximo] = useState(uavInicial?.pesoMaximo || '');
  const [autonomia, setAutonomia] = useState(uavInicial?.autonomia || '');
  const [alcanceMax, setAlcanceMax] = useState(uavInicial?.alcanceMax || '');
  const [velocidadMax, setVelocidadMax] = useState(uavInicial?.velocidadMax || '');
  const [camara, setCamara] = useState(uavInicial?.camara || '');
  const [serialId, setSerialId] = useState(uavInicial?.serialId || '');
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ codigo, modelo, estado, pesoMaximo, autonomia, alcanceMax, velocidadMax, camara, serialId }, archivo);
  }

  const inputClass = "w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 space-y-4">
      <h3 className="font-display font-semibold text-navy-dark">{uavInicial ? 'Editar UAV' : 'Nuevo UAV'}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Código</label>
          <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required disabled={!!uavInicial} className={`${inputClass} disabled:bg-slate-100`} placeholder="UAV-004" />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
            <option value="operativo">Operativo</option>
            <option value="en_mantenimiento">En mantenimiento</option>
            <option value="de_baja">De baja</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Modelo</label>
        <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} required className={inputClass} placeholder="DJI Mavic 3T" />
      </div>

      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide pt-2">Especificaciones técnicas (opcional)</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Peso máximo (kg)</label>
          <input type="number" step="0.1" value={pesoMaximo} onChange={(e) => setPesoMaximo(e.target.value)} className={inputClass} placeholder="0.9" />
        </div>
        <div>
          <label className={labelClass}>Autonomía (min)</label>
          <input type="number" value={autonomia} onChange={(e) => setAutonomia(e.target.value)} className={inputClass} placeholder="45" />
        </div>
        <div>
          <label className={labelClass}>Alcance máx. (km)</label>
          <input type="number" value={alcanceMax} onChange={(e) => setAlcanceMax(e.target.value)} className={inputClass} placeholder="15" />
        </div>
        <div>
          <label className={labelClass}>Velocidad máx. (m/s)</label>
          <input type="number" value={velocidadMax} onChange={(e) => setVelocidadMax(e.target.value)} className={inputClass} placeholder="21" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Cámara</label>
        <input type="text" value={camara} onChange={(e) => setCamara(e.target.value)} className={inputClass} placeholder="Cámara 4/3 CMOS 20 MP" />
      </div>

      <div>
        <label className={labelClass}>Serial / ID</label>
        <input type="text" value={serialId} onChange={(e) => setSerialId(e.target.value)} className={inputClass} placeholder="07QHK9J00145" />
      </div>

      <div>
        <label className={labelClass}>Foto</label>
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