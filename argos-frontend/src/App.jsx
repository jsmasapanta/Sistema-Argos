import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import UAVs from './pages/UAVs';
import Pilotos from './pages/Pilotos';
import Vuelos from './pages/Vuelos';
import MisVuelos from './pages/MisVuelos';
import Reportes from './pages/Reportes';
import RutaProtegida from './components/RutaProtegida';
import Usuarios from './pages/Usuarios'; 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
      <Route path="/uavs" element={<RutaProtegida rolesPermitidos={['admin', 'operador']}><UAVs /></RutaProtegida>} />
      <Route path="/pilotos" element={<RutaProtegida rolesPermitidos={['admin', 'operador']}><Pilotos /></RutaProtegida>} />
      <Route path="/vuelos" element={<RutaProtegida rolesPermitidos={['admin', 'operador']}><Vuelos /></RutaProtegida>} />
      <Route path="/mis-vuelos" element={<RutaProtegida rolesPermitidos={['piloto']}><MisVuelos /></RutaProtegida>} />
      <Route path="/reportes" element={<RutaProtegida rolesPermitidos={['admin', 'operador']}><Reportes /></RutaProtegida>} />
      <Route path="/usuarios" element={<RutaProtegida rolesPermitidos={['admin']}><Usuarios /></RutaProtegida>} /> {/* junto a las demás rutas */}
    </Routes>
  );
}

export default App;