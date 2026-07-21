const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/entrega.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', authorize('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), ctrl.crear);
router.put('/:id/calificar', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.calificar);
router.delete('/:id', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.eliminar);

module.exports = router;
