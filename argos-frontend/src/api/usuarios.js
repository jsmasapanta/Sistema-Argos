import apiClient from './client';

export async function listarUsuarios() {
  const { data } = await apiClient.get('/auth/usuarios');
  return data;
}

export async function registrarUsuario(usuario) {
  const { data } = await apiClient.post('/auth/register', usuario);
  return data;
}