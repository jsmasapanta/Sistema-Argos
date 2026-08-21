import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import HeroCarousel from '../components/HeroCarousel';
import PanelEstadisticas from '../components/PanelEstadisticas';
import CentroAlertas from '../components/CentroAlertas';
import ActividadReciente from '../components/ActividadReciente';
import AccesosRapidos from '../components/AccesosRapidos';

export default function Inicio() {
  const { usuario } = useAuth();

  return (
    <Layout>
            <div className="px-10 pt-10 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-accent tracking-[0.25em] uppercase mb-2">
              Ejército Ecuatoriano · GMREC
            </p>
            <h1 className="font-display font-semibold text-4xl lg:text-5xl text-navy-dark tracking-wide">
              Sistema ARGOS
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-navy-dark px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <p className="text-xs font-semibold text-ice tracking-[0.15em] uppercase">
              Sesión: <span className="text-gold capitalize">{usuario?.rol}</span>
            </p>
          </div>
        </div>
        <div className="h-px bg-slate-200 mt-6" />
      </div>

      <div className="px-10">
        <HeroCarousel />
      </div>

      {usuario?.rol !== 'piloto' && (
        <div className="px-10 pb-8 space-y-6">
          <div className="border-l-2 border-gold pl-3">
            <p className="text-sm font-semibold text-navy-dark tracking-[0.1em] uppercase">Estado operacional</p>
            <p className="text-xs text-slate-500">Resumen general de capacidades del sistema</p>
          </div>

          <PanelEstadisticas />
          <CentroAlertas />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActividadReciente />
            </div>
            <AccesosRapidos />
          </div>
        </div>
      )}

      {usuario?.rol === 'piloto' && (
        <div className="px-10 pb-8">
          <p className="text-sm text-slate-500">
            Entra a <span className="font-medium text-navy-dark">Mis Vuelos</span> desde el menú lateral para ver tu historial.
          </p>
        </div>
      )}
    </Layout>
  );
}