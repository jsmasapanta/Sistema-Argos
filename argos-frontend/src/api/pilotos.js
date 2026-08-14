import apiClient from './client';

export async function listarPilotos() {
  const { data } = await apiClient.get('/pilotos');
  return data;
}

export async function crearPiloto(piloto) {
  const { data } = await apiClient.post('/pilotos', piloto);
  return data;
}

export async function actualizarPiloto(id, piloto) {
  const { data } = await apiClient.put(`/pilotos/${id}`, piloto);
  return data;
}

export async function eliminarPiloto(id) {
  await apiClient.delete(`/pilotos/${id}`);
}

export async function subirFotoPiloto(id, archivo) {
  const formData = new FormData();
  formData.append('foto', archivo);
  const { data } = await apiClient.post(`/pilotos/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}