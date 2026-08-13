const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  listarVuelos,
  obtenerVuelo,
  misVuelos,
  crearVuelo,
  actualizarVuelo,
} = require('../controllers/vuelo.controller');

const router = express.Router();

router.use(authenticate);

router.get('/mios', misVuelos); // cualquier piloto autenticado ve solo los suyos
router.get('/', checkRole('admin', 'operador'), listarVuelos); // vista general, no para pilotos
router.get('/:id', obtenerVuelo);
router.post('/', crearVuelo); // cualquier rol autenticado puede registrar un vuelo (típicamente el piloto)
router.put('/:id', actualizarVuelo);

module.exports = router;