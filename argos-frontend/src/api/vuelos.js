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