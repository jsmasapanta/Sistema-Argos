import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Lock, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import fondoLogin from '../assets/fondo-login.png';
import selloHero from '../assets/sello-hero.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${fondoLogin})` }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(13,27,51,0.25) 0%, rgba(13,27,51,0.45) 50%, rgba(13,27,51,0.7) 100%)' }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-10">
        <div className="flex flex-col items-center flex-shrink-0">
          <img
            src={selloHero}
            alt="Sello ARGOS · GMREC"
            className="w-56 h-56 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
          />
          <h1 className="font-display font-semibold text-white text-2xl lg:text-3xl tracking-[0.08em] drop-shadow-lg mt-3">
            SISTEMA ARGOS
          </h1>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="h-px w-10 bg-gold/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="h-px w-10 bg-gold/50" />
          </div>
        </div>

        <div className="w-full max-w-lg flex-shrink-0">
          <div className="bg-navy-dark/70 backdrop-blur-md border border-gold/25 p-8 lg:p-10 shadow-2xl">
            <p className="text-[12px] font-semibold text-gold tracking-[0.25em] uppercase mb-1.5 text-center">
              Acceso al sistema
            </p>
            <p className="text-sm text-ice/60 text-center mb-7 tracking-wide">
              Registro de UAV y Pilotos — Ejército Ecuatoriano
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-ice/70 tracking-[0.15em] uppercase mb-1.5">
                  Correo
                </label>
                <div className="relative">
                  <UserRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ice/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-navy-dark/60 border border-navy-light text-white pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-gold placeholder:text-ice/30 tracking-wide"
                    placeholder="admin@argos.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ice/70 tracking-[0.15em] uppercase mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ice/40" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-navy-dark/60 border border-navy-light text-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-gold placeholder:text-ice/30 tracking-wide"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ice/40 hover:text-ice/70"
                  >
                    {mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-accent text-sm bg-accent/10 border border-accent/30 px-3 py-2 tracking-wide">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-gold text-navy-dark font-semibold uppercase tracking-[0.15em] text-sm py-3 hover:opacity-90 transition disabled:opacity-50"
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] text-ice/60 uppercase tracking-[0.2em] mt-4 drop-shadow">
            Grupo de Monitoreo y Reconocimiento Electrónico del Ejército
          </p>
        </div>
      </div>
    </div>
  );
}