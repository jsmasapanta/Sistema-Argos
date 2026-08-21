import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import fondoLogin from '../assets/fondo-login.png';

const fotosOperacion = import.meta.glob('../assets/operaciones/*', { eager: true, import: 'default' });

const slides = [
  fondoLogin,
  ...Object.keys(fotosOperacion)
    .sort()
    .map((ruta) => fotosOperacion[ruta]),
];

export default function HeroCarousel() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndice((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function anterior() {
    setIndice((i) => (i - 1 + slides.length) % slides.length);
  }
  function siguiente() {
    setIndice((i) => (i + 1) % slides.length);
  }

  const imagen = slides[indice];

  return (
    <div className="relative h-80 lg:h-[26rem] overflow-hidden mb-8 group bg-navy-dark">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-70"
        style={{ backgroundImage: `url(${imagen})` }}
      />
      <img
        src={imagen}
        alt={`Fotografía operativa ${indice + 1}`}
        className="absolute inset-0 w-full h-full object-contain z-10"
      />

      {slides.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-navy-dark/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-navy-dark/80 z-20"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={siguiente}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-navy-dark/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-navy-dark/80 z-20"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndice(i)}
                className={`h-1 transition-all ${i === indice ? 'w-6 bg-gold' : 'w-3 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}