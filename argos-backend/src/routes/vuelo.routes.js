const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  listarVuelos,
  obtenerVuelo,
  misVuelos,
  crearVuelo,
  actualizarVuelo,
  subirFotoVuelo,
} = require('../controllers/vuelo.controller');
const crearUpload = require('../middlewares/upload.middleware');

const router = express.Router();
const uploadVuelo = crearUpload('vuelos');

router.use(authenticate);
router.post('/:id/foto', uploadVuelo.single('foto'), subirFotoVuelo);
router.get('/mios', misVuelos); // cualquier piloto autenticado ve solo los suyos
router.get('/', checkRole('admin', 'operador'), listarVuelos); // vista general, no para pilotos
router.get('/:id', obtenerVuelo);
router.post('/', crearVuelo); // cualquier rol autenticado puede registrar un vuelo (típicamente el piloto)
router.put('/:id', actualizarVuelo);

module.exports = router;