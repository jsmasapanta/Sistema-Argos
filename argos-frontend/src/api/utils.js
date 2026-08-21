export function diasHastaVencimiento(fecha) {
  const hoy = new Date();
  const vencimiento = new Date(fecha);
  const diferenciaMs = vencimiento - hoy;
  return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
}

export function estadoLicencia(fecha) {
  const dias = diasHastaVencimiento(fecha);
  if (dias < 0) return { nivel: 'vencida', texto: 'Licencia vencida', dias };
  if (dias <= 30) return { nivel: 'por_vencer', texto: `Vence en ${dias} día(s)`, dias };
  return { nivel: 'vigente', texto: 'Vigente', dias };
}

const UMBRAL_HORAS_MANTENIMIENTO = 50;

export function necesitaMantenimientoPronto(uav) {
  return uav.estado === 'operativo' && uav.horasTotales >= UMBRAL_HORAS_MANTENIMIENTO;
}

export function tiempoRelativo(fecha) {
  if (!fecha) return 'Nunca';
  const ahora = new Date();
  const f = new Date(fecha);
  const segundos = Math.floor((ahora - f) / 1000);

  if (segundos < 60) return 'Hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  return f.toLocaleDateString('es-EC');
}