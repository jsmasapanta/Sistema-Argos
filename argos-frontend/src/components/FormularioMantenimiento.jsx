import { useState } from 'react';

export default function FormularioMantenimiento({ uav, onGuardar, onCancelar, guardando }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onGuardar({ uavId: uav.id, fecha, tipo, descripcion });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-slate-900">Registrar mantenimiento — {uav.codigo}</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Selecciona un tipo</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
            <option value="Revisión post-vuelo">Revisión post-vuelo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Detalle de la intervención"
          />
        </div>

        <p className="text-xs text-slate-400">
          Al guardar, el UAV pasará automáticamente a estado "en mantenimiento".
        </p>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-slate-900 text-white font-medium rounded-lg px-4 py-2 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
          <button type="button" onClick={onCancelar} className="text-slate-600 hover:text-slate-900 transition px-4 py-2">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}