import { useQuery } from '@tanstack/react-query';
import { Plane } from 'lucide-react';
import { listarUAVs } from '../api/uavs';

export default function UAVsDisponibles() {
  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });

  const badgeEstado = {
    operativo: 'bg-success/10 text-success',
    en_mantenimiento: 'bg-warning/10 text-warning',
    de_baja: 'bg-slate-200 text-slate-600',
  };

  return (
    <div className="bg-white border border-slate-200 p-5">
      <p className="text-[11px] font-semibold text-navy-dark tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
        <Plane size={14} className="text-accent" /> UAVs disponibles
      </p>
      <div className="space-y-2">
        {uavs?.map((u) => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-navy-dark">{u.codigo}</p>
              <p className="text-xs text-slate-500">{u.modelo}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${badgeEstado[u.estado]}`}>
              {u.estado.replace('_', ' ')}
            </span>
          </div>
        ))}
        {(!uavs || uavs.length === 0) && <p className="text-sm text-slate-400">Sin UAVs registrados.</p>}
      </div>
    </div>
  );
}