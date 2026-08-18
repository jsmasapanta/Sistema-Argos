import apiClient from './client';

export async function listarUAVs() {
  const { data } = await apiClient.get('/uavs');
  return data;
}

export async function crearUAV(uav) {
  const { data } = await apiClient.post('/uavs', uav);
  return data;
}

export async function actualizarUAV(id, uav) {
  const { data } = await apiClient.put(`/uavs/${id}`, uav);
  return data;
}

export async function eliminarUAV(id) {
  await apiClient.delete(`/uavs/${id}`);
}

export async function subirFotoUAV(id, archivo) {
  const formData = new FormData();
  formData.append('foto', archivo);
  const { data } = await apiClient.post(`/uavs/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function finalizarMantenimientoUAV(id) {
  const { data } = await apiClient.put(`/uavs/${id}/finalizar-mantenimiento`);
  return data;
}