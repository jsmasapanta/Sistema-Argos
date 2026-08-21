import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Wrench, IdCard } from 'lucide-react';
import { listarUAVs } from '../api/uavs';
import { listarPilotos } from '../api/pilotos';
import { necesitaMantenimientoPronto, estadoLicencia } from '../api/utils';

export default function CentroAlertas() {
  const { data: uavs } = useQuery({ queryKey: ['uavs'], queryFn: listarUAVs });
  const { data: pilotos } = useQuery({ queryKey: ['pilotos'], queryFn: listarPilotos });

  const uavsAlerta = (uavs || []).filter(necesitaMantenimientoPronto);
  const pilotosAlerta = (pilotos || []).filter((p) => estadoLicencia(p.vencimientoLicencia).nivel !== 'vigente');
  const total = uavsAlerta.length + pilotosAlerta.length;

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-white border border-warning/40 overflow-hidden">
      <div className="bg-warning/15 flex items-center gap-2 px-5 py-3 flex-shrink-0">
        <AlertTriangle size={16} className="text-warning" />
        <p className="text-xs font-semibold text-warning tracking-wide uppercase whitespace-nowrap">
          {total} alerta{total > 1 ? 's' : ''} activa{total > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3">
        {uavsAlerta.map((u) => (
          <div key={u.id} className="flex items-start gap-2">
            <Wrench size={13} className="text-warning mt-0.5" />
            <div>
              <p className="text-sm text-navy-dark font-medium">{u.codigo} requiere mantenimiento pronto ({u.horasTotales} h)</p>
              <p className="text-[11px] text-slate-400">Próximo mantenimiento programado</p>
            </div>
          </div>
        ))}
        {pilotosAlerta.map((p) => {
          const estado = estadoLicencia(p.vencimientoLicencia);
          return (
            <div key={p.id} className="flex items-start gap-2">
              <IdCard size={13} className="text-warning mt-0.5" />
              <div>
                <p className="text-sm text-navy-dark font-medium">{p.nombre} — {estado.texto.toLowerCase()}</p>
                <p className="text-[11px] text-slate-400">Credencial de piloto por vencer</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}