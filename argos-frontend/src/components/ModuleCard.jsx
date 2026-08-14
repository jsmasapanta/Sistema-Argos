import { Link } from 'react-router-dom';

export default function ModuleCard({ to, titulo, descripcion, icono, color }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 flex flex-col items-center text-center"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 ${color}`}
      >
        {icono}
      </div>
      <h3 className="font-semibold text-slate-900">{titulo}</h3>
      <p className="text-sm text-slate-500 mt-1">{descripcion}</p>
    </Link>
  );
}