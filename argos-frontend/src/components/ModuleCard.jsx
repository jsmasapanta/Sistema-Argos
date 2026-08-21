import { Link } from 'react-router-dom';

export default function ModuleCard({ to, titulo, descripcion, Icon }) {
  return (
    <Link
      to={to}
      className="group bg-white border border-slate-200 hover:border-gold transition-colors flex flex-col"
    >
      <div className="h-28 bg-navy-dark flex items-center justify-center relative overflow-hidden">
        <Icon size={32} className="text-white/90 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold/0 group-hover:bg-gold/70 transition-colors" />
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold text-accent tracking-[0.2em] uppercase mb-1">Módulo</p>
        <h3 className="font-display font-semibold text-navy-dark text-base tracking-wide">{titulo}</h3>
        <p className="text-sm text-slate-500 mt-1">{descripcion}</p>
      </div>
    </Link>
  );
}