export default function ConfirmarAccion({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-slate-800">{mensaje}</p>
        <div className="flex gap-3 pt-4 justify-end">
          <button
            onClick={onCancelar}
            className="text-slate-600 hover:text-slate-900 transition px-4 py-2 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="bg-red-700 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-800 transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}