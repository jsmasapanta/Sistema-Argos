import { X, User, Plane, Target, MapPin, Route, CloudSun, BatteryMedium, FileText, Pencil } from 'lucide-react';
import { urlFoto } from '../api/config';

const badgeEstado = {
  completado: 'bg-success/10 text-success',
  finalizado: 'bg-navy/10 text-navy',
  con_novedad: 'bg-warning/10 text-warning',
};
const textoEstado = { completado: 'Completado', finalizado: 'Finalizado', con_novedad: 'Con novedad' };

export default function DetalleVuelo({ vuelo, onCerrar, onEditar }) {
  function calcularHoras(inicio, fin) {
    return ((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60)).toFixed(1);
  }

  const filas = [
    { Icon: Target, label: 'Misión', valor: vuelo.mision },
    { Icon: MapPin, label: 'Objetivo', valor: vuelo.objetivo },
    { Icon: Route, label: 'Área / Sector', valor: vuelo.areaSector },
    { Icon: CloudSun, label: 'Condiciones climáticas', valor: vuelo.condicionesClimaticas },
    { Icon: BatteryMedium, label: 'Batería utilizada', valor: vuelo.bateriaUtilizada ? `${vuelo.bateriaUtilizada}%` : null },
    { Icon: FileText, label: 'Observaciones', valor: vuelo.novedades },
  ].filter((f) => f.valor);

  return (
    <div className="bg-white border border-slate-200 sticky top-8">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-display font-semibold text-navy-dark">Detalle del vuelo</h3>
        <button onClick={onCerrar} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${badgeEstado[vuelo.estado]}`}>
            {textoEstado[vuelo.estado]}
          </span>
          <span className="text-[11px] text-slate-400">ID: {vuelo.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {vuelo.piloto?.fotoUrl ? (
              <img src={urlFoto(vuelo.piloto.fotoUrl)} alt={vuelo.piloto.nombre} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-slate-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-navy-dark">{vuelo.piloto?.nombre}</p>
            <p className="text-xs text-slate-500">{vuelo.piloto?.licencia}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-sm text-navy-dark">
            <Plane size={14} className="text-slate-400" /> {vuelo.uav?.codigo}
          </div>
        </div>

        <div className="space-y-3 text-xs mb-4">
          <div className="flex justify-between"><span className="text-slate-500">Inicio</span><span className="text-navy-dark">{new Date(vuelo.fechaInicio).toLocaleString('es-EC')}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Fin</span><span className="text-navy-dark">{new Date(vuelo.fechaFin).toLocaleString('es-EC')}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Duración</span><span className="text-navy-dark font-medium">{calcularHoras(vuelo.fechaInicio, vuelo.fechaFin)} h</span></div>
        </div>

        {filas.length > 0 && (
          <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
            {filas.map((f) => (
              <div key={f.label} className="flex justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500 flex-shrink-0"><f.Icon size={12} /> {f.label}</span>
                <span className="text-navy-dark text-right">{f.valor}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onEditar}
          className="w-full mt-5 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 text-sm font-medium py-2 hover:bg-slate-50"
        >
          <Pencil size={14} /> Editar vuelo
        </button>
      </div>
    </div>
  );
}