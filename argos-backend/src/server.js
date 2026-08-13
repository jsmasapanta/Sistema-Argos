const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const uavRoutes = require('./routes/uav.routes');
const { authenticate, checkRole } = require('./middlewares/auth.middleware');
const pilotoRoutes = require('./routes/piloto.routes');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'ARGOS API funcionando' });
});

app.get('/api/v1/solo-admin', authenticate, checkRole('admin'), (req, res) => {
  res.json({ mensaje: `Hola ${req.user.email}, entraste como ${req.user.rol}` });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/uavs', uavRoutes);
app.use('/api/v1/pilotos', pilotoRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`ARGOS API corriendo en http://localhost:${PORT}`);
});