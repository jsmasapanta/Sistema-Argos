import { useAuth } from '../context/AuthContext';
import ModuleCard from '../components/ModuleCard';

const TODOS_LOS_MODULOS = [
  { id: 'uavs', to: '/uavs', titulo: 'UAVs', descripcion: 'Registro y estado de drones', icono: '✈', color: 'bg-slate-900', roles: ['admin', 'operador'] },
  { id: 'pilotos', to: '/pilotos', titulo: 'Pilotos', descripcion: 'Personal y licencias', icono: '👤', color: 'bg-red-700', roles: ['admin', 'operador'] },
  { id: 'vuelos', to: '/vuelos', titulo: 'Bitácora de Vuelos', descripcion: 'Registro de vuelos', icono: 'V', color: 'bg-slate-700', roles: ['admin', 'operador'] },
  { id: 'mis-vuelos', to: '/mis-vuelos', titulo: 'Mis Vuelos', descripcion: 'Tu historial de vuelos', icono: 'V', color: 'bg-slate-700', roles: ['piloto'] },
  { id: 'reportes', to: '/reportes', titulo: 'Reportes', descripcion: 'Resumen y estadísticas', icono: '◉', color: 'bg-red-700', roles: ['admin', 'operador'] },
  { id: 'usuarios', to: '/usuarios', titulo: 'Usuarios', descripcion: 'Cuentas y roles del sistema', icono: '⚙', color: 'bg-slate-900', roles: ['admin'] },
];

export default function Inicio() {
  const { usuario, logout } = useAuth();

  const modulosVisibles = TODOS_LOS_MODULOS.filter((m) => m.roles.includes(usuario?.rol));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="h-1.5 bg-red-700" />
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-red-700 tracking-wide">EJÉRCITO ECUATORIANO · GMREC</p>
            <h1 className="text-xl font-bold text-slate-900">SISTEMA ARGOS</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-700">{usuario?.email}</p>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-red-700 transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Bienvenido — rol: <span className="capitalize">{usuario?.rol}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {modulosVisibles.map((m) => (
            <ModuleCard key={m.id} to={m.to} titulo={m.titulo} descripcion={m.descripcion} icono={m.icono} color={m.color} />
          ))}
        </div>
      </main>
    </div>
  );
}