import apiClient from './client';

export async function listarMantenimientos() {
  const { data } = await apiClient.get('/mantenimientos');
  return data;
}

export async function crearMantenimiento(mantenimiento) {
  const { data } = await apiClient.post('/mantenimientos', mantenimiento);
  return data;
}

export async function finalizarMantenimiento(id) {
  const { data } = await apiClient.put(`/mantenimientos/${id}/finalizar`);
  return data;
}