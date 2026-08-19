const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const crearUpload = require('../middlewares/upload.middleware');
const {
  listarPilotos,
  obtenerPiloto,
  crearPiloto,
  actualizarPiloto,
  eliminarPiloto,
  subirFotoPiloto,
  miPerfil,
} = require('../controllers/piloto.controller');

const router = express.Router();
const uploadPiloto = crearUpload('pilotos');

router.use(authenticate);

router.get('/', listarPilotos);
router.get('/mi-perfil', miPerfil);
router.get('/:id', obtenerPiloto);
router.post('/', checkRole('admin'), crearPiloto);
router.put('/:id', checkRole('admin', 'operador'), actualizarPiloto);
router.post('/:id/foto', checkRole('admin', 'operador', 'piloto'), uploadPiloto.single('foto'), subirFotoPiloto);
router.delete('/:id', checkRole('admin'), eliminarPiloto);

module.exports = router;