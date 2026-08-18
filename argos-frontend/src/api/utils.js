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