import { useState } from 'react';

export default function FormularioPiloto({ pilotoInicial, onGuardar, onCancelar, guardando }) {
  const [usuarioId, setUsuarioId] = useState(pilotoInicial?.usuarioId || '');
  const [nombre, setNombre] = useState(pilotoInicial?.nombre || '');
  const [licencia, setLicencia] = useState(pilotoInicial?.licencia || '');
  const [vencimientoLicencia, setVencimientoLicencia] = useState(
    pilotoInicial?.vencimientoLicencia ? pilotoInicial.vencimientoLicencia.slice(0, 10) : ''
  );
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ usuarioId, nombre, licencia, vencimientoLicencia }, archivo);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">{pilotoInicial ? 'Editar Piloto' : 'Nuevo Piloto'}</h3>

      {!pilotoInicial && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID de usuario (rol piloto)</label>
          <input
            type="text"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Pega aquí el id del usuario"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Licencia</label>
        <input
          type="text"
          value={licencia}
          onChange={(e) => setLicencia(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="LIC-UAV-2024-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento de licencia</label>
        <input
          type="date"
          value={vencimientoLicencia}
          onChange={(e) => setVencimientoLicencia(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foto (opcional)</label>
        <div className="flex items-center gap-3">
          {previewFoto && (
            <img src={previewFoto} alt="Vista previa" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
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