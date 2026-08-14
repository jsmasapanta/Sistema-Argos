import { useState } from 'react';

export default function FormularioUAV({ uavInicial, onGuardar, onCancelar, guardando }) {
  const [codigo, setCodigo] = useState(uavInicial?.codigo || '');
  const [modelo, setModelo] = useState(uavInicial?.modelo || '');
  const [estado, setEstado] = useState(uavInicial?.estado || 'operativo');
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ codigo, modelo, estado }, archivo);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">{uavInicial ? 'Editar UAV' : 'Nuevo UAV'}</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
          disabled={!!uavInicial}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100"
          placeholder="UAV-002"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
        <input
          type="text"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="DJI Mavic 3T"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="operativo">Operativo</option>
          <option value="en_mantenimiento">En mantenimiento</option>
          <option value="de_baja">De baja</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foto (opcional)</label>
        <div className="flex items-center gap-3">
          {previewFoto && (
            <img src={previewFoto} alt="Vista previa" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
          )}
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 transition text-slate-700 text-sm font-medium rounded-lg px-4 py-2 border border-slate-300">
            {archivo ? 'Cambiar imagen' : 'Seleccionar imagen'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivo(file);
                if (file) setPreviewFoto(URL.createObjectURL(file));
              }}
              className="hidden"
            />
          </label>
          {archivo && <span className="text-xs text-slate-500 truncate max-w-[120px]">{archivo.name}</span>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-slate-900 text-white font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="text-slate-600 hover:text-slate-900 transition px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}