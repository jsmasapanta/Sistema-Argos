const express = require('express');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');
const { exportarPDF, exportarExcel } = require('../controllers/exportar.controller');

const router = express.Router();

router.use(authenticate);
router.use(checkRole('admin', 'operador'));

router.get('/pdf', exportarPDF);
router.get('/excel', exportarExcel);

module.exports = router;