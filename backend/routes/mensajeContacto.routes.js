const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mensajeContacto.controller');
const { verifyToken, authorize } = require('../middleware/auth');

// Envío de mensaje: público, sin autenticación (formulario de contacto del sitio)
router.post('/', ctrl.crear);

router.get('/', verifyToken, authorize('ADMINISTRADOR'), ctrl.listar);
router.put('/:id/atender', verifyToken, authorize('ADMINISTRADOR'), ctrl.marcarAtendido);
router.delete('/:id', verifyToken, authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
