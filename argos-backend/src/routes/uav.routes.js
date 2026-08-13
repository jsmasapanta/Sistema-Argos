const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  listarUAVs,
  obtenerUAV,
  crearUAV,
  actualizarUAV,
  eliminarUAV,
} = require('../controllers/uav.controller');

const router = express.Router();

router.use(authenticate); // todas las rutas de abajo requieren estar logueado

router.get('/', listarUAVs); // cualquier rol autenticado puede ver
router.get('/:id', obtenerUAV);
router.post('/', checkRole('admin', 'operador'), crearUAV);
router.put('/:id', checkRole('admin', 'operador'), actualizarUAV);
router.delete('/:id', checkRole('admin'), eliminarUAV); // solo admin borra

module.exports = router;