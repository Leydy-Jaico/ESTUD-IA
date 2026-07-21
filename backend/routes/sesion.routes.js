const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sesion.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.crear);
router.put('/:id', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.actualizar);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
