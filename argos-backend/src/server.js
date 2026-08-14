const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const uavRoutes = require('./routes/uav.routes');
const { authenticate, checkRole } = require('./middlewares/auth.middleware');
const pilotoRoutes = require('./routes/piloto.routes');
const app = express();
const vueloRoutes = require('./routes/vuelo.routes');
const reporteRoutes = require('./routes/reporte.routes');
const path = require('path');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'ARGOS API funcionando' });
});

app.get('/api/v1/solo-admin', authenticate, checkRole('admin'), (req, res) => {
  res.json({ mensaje: `Hola ${req.user.email}, entraste como ${req.user.rol}` });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/uavs', uavRoutes);
app.use('/api/v1/pilotos', pilotoRoutes);
app.use('/api/v1/vuelos', vueloRoutes);
app.use('/api/v1/reportes', reporteRoutes);
app.use('/api/v1/mantenimientos', mantenimientoRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`ARGOS API corriendo en http://localhost:${PORT}`);
});