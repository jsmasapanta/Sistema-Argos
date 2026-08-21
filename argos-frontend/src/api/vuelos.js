import apiClient from './client';

export async function listarVuelos() {
  const { data } = await apiClient.get('/vuelos');
  return data;
}

export async function misVuelos() {
  const { data } = await apiClient.get('/vuelos/mios');
  return data;
}

export async function crearVuelo(vuelo) {
  const { data } = await apiClient.post('/vuelos', vuelo);
  return data;
}

export async function actualizarVuelo(id, datos) {
  const { data } = await apiClient.put(`/vuelos/${id}`, datos);
  return data;
}

export async function subirFotoVuelo(id, archivo) {
  const formData = new FormData();
  formData.append('foto', archivo);
  const { data } = await apiClient.post(`/vuelos/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}