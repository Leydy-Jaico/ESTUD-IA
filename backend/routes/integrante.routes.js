const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/integrante.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', authorize('ADMINISTRADOR', 'DESARROLLADOR'), ctrl.crear);
router.put('/:id', authorize('ADMINISTRADOR', 'DESARROLLADOR'), ctrl.actualizar);
router.delete('/:id', authorize('ADMINISTRADOR', 'DESARROLLADOR'), ctrl.eliminar);

module.exports = router;
