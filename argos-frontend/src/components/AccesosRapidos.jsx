import { Link } from 'react-router-dom';
import { PlaneTakeoff, Wrench, UserPlus, Plane, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccesosRapidos() {
  const { usuario } = useAuth();

  const acciones = [
    { to: '/vuelos', label: 'Registrar vuelo', Icon: PlaneTakeoff, roles: ['admin', 'operador'] },
    { to: '/uavs', label: 'Agregar mantenimiento', Icon: Wrench, roles: ['admin', 'operador'] },
    { to: '/pilotos', label: 'Nuevo piloto', Icon: UserPlus, roles: ['admin'] },
    { to: '/uavs', label: 'Nuevo UAV', Icon: Plane, roles: ['admin', 'operador'] },
  ].filter((a) => a.roles.includes(usuario?.rol));

  if (acciones.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 p-5 h-full">
      <p className="text-[11px] font-semibold text-navy-dark tracking-[0.2em] uppercase mb-4">Accesos rápidos</p>
      <div className="space-y-1">
        {acciones.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-3 px-2 py-2.5 hover:bg-ice/60 transition group"
          >
            <div className="w-8 h-8 bg-ice flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition">
              <a.Icon size={14} className="text-accent" />
            </div>
            <span className="text-sm text-navy-dark flex-1">{a.label}</span>
            <ChevronRight size={14} className="text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}