const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  listarMantenimientos,
  crearMantenimiento,
  finalizarMantenimiento,
  actualizarMantenimiento,
} = require('../controllers/mantenimiento.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', listarMantenimientos);
router.post('/', checkRole('admin', 'operador'), crearMantenimiento);
router.put('/:id/finalizar', checkRole('admin', 'operador'), finalizarMantenimiento);
router.put('/:id', checkRole('admin', 'operador'), actualizarMantenimiento);

module.exports = router;