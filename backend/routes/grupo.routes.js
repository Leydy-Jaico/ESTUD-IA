const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/grupo.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', authorize('ADMINISTRADOR'), ctrl.crear);
router.put('/:id', authorize('ADMINISTRADOR'), ctrl.actualizar);
router.put('/:id/asignar-docente', authorize('ADMINISTRADOR'), ctrl.asignarDocente);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
