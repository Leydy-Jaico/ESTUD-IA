const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comunicacion.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.put('/:id/estado', authorize('ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'), ctrl.actualizarEstado);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
