import apiClient from './client';

export async function resumenGeneral() {
  const { data } = await apiClient.get('/reportes/resumen');
  return data;
}

export async function horasPorPiloto() {
  const { data } = await apiClient.get('/reportes/horas-por-piloto');
  return data;
}

export async function horasPorUAV() {
  const { data } = await apiClient.get('/reportes/horas-por-uav');
  return data;
}

export async function historialMantenimiento() {
  const { data } = await apiClient.get('/reportes/mantenimientos');
  return data;
}