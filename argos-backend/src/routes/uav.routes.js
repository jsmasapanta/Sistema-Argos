const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const crearUpload = require('../middlewares/upload.middleware');
const {
  listarUAVs,
  obtenerUAV,
  crearUAV,
  actualizarUAV,
  eliminarUAV,
  subirFotoUAV,
  finalizarMantenimientoUAV,
} = require('../controllers/uav.controller');

const router = express.Router();
const uploadUAV = crearUpload('uavs');

router.use(authenticate);

router.get('/', listarUAVs);
router.get('/:id', obtenerUAV);
router.post('/', checkRole('admin', 'operador'), crearUAV);
router.put('/:id', checkRole('admin', 'operador'), actualizarUAV);
router.put('/:id/finalizar-mantenimiento', checkRole('admin', 'operador'), finalizarMantenimientoUAV);
router.post('/:id/foto', checkRole('admin', 'operador'), uploadUAV.single('foto'), subirFotoUAV);
router.delete('/:id', checkRole('admin'), eliminarUAV);

module.exports = router;