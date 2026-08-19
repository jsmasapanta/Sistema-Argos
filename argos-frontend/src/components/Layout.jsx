import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Users, ClipboardList, BarChart3, UserCog, LogOut, Shield } from 'lucide-react';

const MODULOS_NAV = [
  { to: '/uavs', label: 'UAVs', icon: Plane, roles: ['admin', 'operador'] },
  { to: '/pilotos', label: 'Pilotos', icon: Users, roles: ['admin', 'operador'] },
  { to: '/vuelos', label: 'Bitácora', icon: ClipboardList, roles: ['admin', 'operador'] },
  { to: '/mis-vuelos', label: 'Mis Vuelos', icon: ClipboardList, roles: ['piloto'] },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin', 'operador'] },
  { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['admin'] },
];

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const modulosVisibles = MODULOS_NAV.filter((m) => m.roles.includes(usuario?.rol));

  return (
    <div className="min-h-screen bg-ice flex">
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-accent z-20" />

      <aside className="w-60 bg-navy-dark flex flex-col fixed top-1.5 bottom-0 left-0 z-10">
        <div className="px-5 py-6 border-b border-navy-light/40">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-accent" strokeWidth={2} />
            <div>
              <p className="text-[10px] font-medium text-ice/60 tracking-widest uppercase">GMREC</p>
              <p className="font-display font-semibold text-white text-lg leading-none">ARGOS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              location.pathname === '/' ? 'bg-navy text-white' : 'text-ice/70 hover:bg-navy/60 hover:text-white'
            }`}
          >
            <Shield size={17} />
            Inicio
          </Link>
          {modulosVisibles.map((m) => {
            const Icon = m.icon;
            const activo = location.pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activo ? 'bg-navy text-white' : 'text-ice/70 hover:bg-navy/60 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-navy-light/40">
          <p className="text-xs text-ice/50 truncate">{usuario?.email}</p>
          <p className="text-[10px] text-ice/40 uppercase tracking-wider mt-0.5">{usuario?.rol}</p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-xs text-ice/60 hover:text-accent transition"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 mt-1.5 min-h-screen">{children}</main>
    </div>
  );
}