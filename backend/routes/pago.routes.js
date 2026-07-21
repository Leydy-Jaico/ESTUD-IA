const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pago.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', authorize('ADMINISTRADOR', 'ESTUDIANTE'), ctrl.crear);
router.put('/:id/verificar', authorize('ADMINISTRADOR'), ctrl.verificar);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
