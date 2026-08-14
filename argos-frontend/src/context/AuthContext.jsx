import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('argos_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  function login(token, datosUsuario) {
    localStorage.setItem('argos_token', token);
    localStorage.setItem('argos_usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }

  function logout() {
    localStorage.removeItem('argos_token');
    localStorage.removeItem('argos_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}