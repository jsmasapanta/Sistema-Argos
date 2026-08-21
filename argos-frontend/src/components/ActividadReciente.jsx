import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plane, Wrench, ArrowRight } from 'lucide-react';
import { listarVuelos } from '../api/vuelos';
import { listarMantenimientos } from '../api/mantenimientos';

export default function ActividadReciente() {
  const { data: vuelos } = useQuery({ queryKey: ['vuelos'], queryFn: listarVuelos });
  const { data: mantenimientos } = useQuery({ queryKey: ['mantenimientos'], queryFn: listarMantenimientos });

  const eventos = [
    ...(vuelos || []).map((v) => ({
      tipo: 'vuelo',
      fecha: v.fechaInicio,
      texto: `Vuelo registrado: ${v.piloto?.nombre} con ${v.uav?.codigo}`,
    })),
    ...(mantenimientos || []).map((m) => ({
      tipo: 'mantenimiento',
      fecha: m.fecha,
      texto: `Mantenimiento (${m.tipo}) en ${m.uav?.codigo}`,
    })),
  ]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const colorIcono = { vuelo: 'bg-ice text-navy', mantenimiento: 'bg-warning/15 text-warning' };
  const Icono = { vuelo: Plane, mantenimiento: Wrench };

  return (
    <div className="bg-white border border-slate-200 p-5 h-full flex flex-col">
      <p className="text-[11px] font-semibold text-navy-dark tracking-[0.2em] uppercase mb-4">Actividad reciente</p>
      {eventos.length === 0 ? (
        <p className="text-sm text-slate-400 flex-1">Aún no hay actividad registrada.</p>
      ) : (
        <div className="space-y-3 flex-1">
          {eventos.map((e, i) => {
            const Ic = Icono[e.tipo];
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${colorIcono[e.tipo]}`}>
                  <Ic size={14} />
                </div>
                <p className="text-sm text-navy-dark flex-1 truncate">{e.texto}</p>
                <p className="text-[11px] text-slate-400 flex-shrink-0">{new Date(e.fecha).toLocaleDateString('es-EC')}</p>
              </div>
            );
          })}
        </div>
      )}
      <Link to="/vuelos" className="flex items-center gap-1 text-xs text-accent hover:opacity-80 mt-4 pt-4 border-t border-slate-100">
        Ver toda la actividad <ArrowRight size={13} />
      </Link>
    </div>
  );
}