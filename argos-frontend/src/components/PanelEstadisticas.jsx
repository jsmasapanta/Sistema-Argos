import { useQuery } from '@tanstack/react-query';
import { Plane, Users, ClipboardList, Wrench } from 'lucide-react';
import { resumenGeneral } from '../api/reportes';
import { listarMantenimientos } from '../api/mantenimientos';
import { listarVuelos } from '../api/vuelos';

export default function PanelEstadisticas() {
  const { data: resumen } = useQuery({ queryKey: ['reporte-resumen'], queryFn: resumenGeneral });
  const { data: mantenimientos } = useQuery({ queryKey: ['mantenimientos'], queryFn: listarMantenimientos });
  const { data: vuelos } = useQuery({ queryKey: ['vuelos'], queryFn: listarVuelos });

  const porcentajeOperativo = resumen && resumen.totalUAVs > 0
    ? Math.round((resumen.uavsOperativos / resumen.totalUAVs) * 100)
    : 0;

  const ahora = new Date();
  const vuelosEsteMes = vuelos?.filter((v) => {
    const f = new Date(v.fechaInicio);
    return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
  }).length || 0;

  const ultimoVuelo = vuelos?.length
    ? new Date(Math.max(...vuelos.map((v) => new Date(v.fechaInicio)))).toLocaleDateString('es-EC')
    : '—';

  const stats = [
    {
      icon: Plane,
      label: 'UAV operativos',
      valor: resumen ? `${resumen.uavsOperativos}/${resumen.totalUAVs}` : '—',
      linea1: `${porcentajeOperativo}% disponibilidad`,
      linea2: resumen ? `${resumen.uavsOperativos} operativos · ${resumen.totalUAVs - resumen.uavsOperativos} en mantenimiento/baja` : '',
    },
    {
      icon: Users,
      label: 'Pilotos activos',
      valor: resumen?.totalPilotos ?? '—',
      linea1: 'Habilitados',
      linea2: resumen ? `${resumen.totalPilotos} pilotos registrados` : '',
    },
    {
      icon: ClipboardList,
      label: 'Vuelos registrados',
      valor: resumen?.totalVuelos ?? '—',
      linea1: `+${vuelosEsteMes} este mes`,
      linea2: `Último vuelo: ${ultimoVuelo}`,
    },
    {
      icon: Wrench,
      label: 'Mantenimientos',
      valor: mantenimientos?.length ?? '—',
      linea1: `${mantenimientos?.length ?? 0} registrados`,
      linea2: 'Historial completo en el módulo',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-slate-200 hover:border-gold/60 transition-colors p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full border border-dashed border-accent/40 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className="text-accent" strokeWidth={1.75} />
            </div>
            <p className="text-[10px] font-semibold text-slate-500 tracking-[0.15em] uppercase">{s.label}</p>
          </div>
          <p className="text-3xl font-display font-semibold text-navy-dark leading-none mb-3">{s.valor}</p>
          <div className="h-px bg-slate-100 mb-3" />
          <p className="text-xs text-accent font-medium">{s.linea1}</p>
          {s.linea2 && <p className="text-xs text-slate-400 mt-0.5">{s.linea2}</p>}
        </div>
      ))}
    </div>
  );
}