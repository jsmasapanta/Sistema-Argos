import apiClient from './client';

export async function listarUsuarios() {
  const { data } = await apiClient.get('/auth/usuarios');
  return data;
}

export async function registrarUsuario(usuario) {
  const { data } = await apiClient.post('/auth/register', usuario);
  return data;
}

export async function cambiarEstadoUsuario(id, activo) {
  const { data } = await apiClient.put(`/auth/usuarios/${id}/estado`, { activo });
  return data;
}

export async function cambiarRolUsuario(id, rol) {
  const { data } = await apiClient.put(`/auth/usuarios/${id}/rol`, { rol });
  return data;
}

export async function eliminarUsuario(id) {
  await apiClient.delete(`/auth/usuarios/${id}`);
}