import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ModuleCard from '../components/ModuleCard';
import { Plane, Users, ClipboardList, BarChart3, UserCog } from 'lucide-react';

const TODOS_LOS_MODULOS = [
  { id: 'uavs', to: '/uavs', titulo: 'UAVs', descripcion: 'Registro y estado de drones', Icon: Plane, roles: ['admin', 'operador'] },
  { id: 'pilotos', to: '/pilotos', titulo: 'Pilotos', descripcion: 'Personal y licencias', Icon: Users, roles: ['admin', 'operador'] },
  { id: 'vuelos', to: '/vuelos', titulo: 'Bitácora de Vuelos', descripcion: 'Registro de vuelos', Icon: ClipboardList, roles: ['admin', 'operador'] },
  { id: 'mis-vuelos', to: '/mis-vuelos', titulo: 'Mis Vuelos', descripcion: 'Tu historial de vuelos', Icon: ClipboardList, roles: ['piloto'] },
  { id: 'reportes', to: '/reportes', titulo: 'Reportes', descripcion: 'Resumen y estadísticas', Icon: BarChart3, roles: ['admin', 'operador'] },
  { id: 'usuarios', to: '/usuarios', titulo: 'Usuarios', descripcion: 'Cuentas y roles del sistema', Icon: UserCog, roles: ['admin'] },
];

export default function Inicio() {
  const { usuario } = useAuth();
  const modulosVisibles = TODOS_LOS_MODULOS.filter((m) => m.roles.includes(usuario?.rol));

  return (
    <Layout>
      <div className="px-10 py-8">
        <p className="text-[11px] font-semibold text-accent tracking-widest uppercase mb-1">
          Ejército Ecuatoriano · GMREC
        </p>
        <h1 className="font-display font-semibold text-3xl text-navy-dark mb-1">
          Sistema ARGOS
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Sesión activa: <span className="capitalize font-medium text-slate-700">{usuario?.rol}</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modulosVisibles.map((m) => (
            <ModuleCard key={m.id} to={m.to} titulo={m.titulo} descripcion={m.descripcion} Icon={m.Icon} />
          ))}
        </div>
      </div>
    </Layout>
  );
}