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

export async function descargarPDF() {
  const response = await apiClient.get('/reportes/exportar/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte-argos.pdf';
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function descargarExcel() {
  const response = await apiClient.get('/reportes/exportar/excel', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte-argos.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}