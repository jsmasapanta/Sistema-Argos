const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  listarPilotos,
  obtenerPiloto,
  crearPiloto,
  actualizarPiloto,
  eliminarPiloto,
} = require('../controllers/piloto.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', listarPilotos);
router.get('/:id', obtenerPiloto);
router.post('/', checkRole('admin'), crearPiloto);
router.put('/:id', checkRole('admin', 'operador'), actualizarPiloto);
router.delete('/:id', checkRole('admin'), eliminarPiloto);

module.exports = router;