const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const {
  horasPorPiloto,
  horasPorUAV,
  historialMantenimiento,
  resumenGeneral,
  horasPorPilotoYUAV,
  mantenimientosPorTipoYEstado,
} = require('../controllers/reporte.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRole('admin', 'operador')); // reportes solo para admin/operador por ahora
router.get('/horas-piloto-uav', horasPorPilotoYUAV);
router.get('/mantenimientos-tipo-estado', mantenimientosPorTipoYEstado);
router.get('/resumen', resumenGeneral);
router.get('/horas-por-piloto', horasPorPiloto);
router.get('/horas-por-uav', horasPorUAV);
router.get('/mantenimientos', historialMantenimiento);

module.exports = router;