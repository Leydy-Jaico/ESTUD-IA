const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proyecto.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', authorize('ADMINISTRADOR', 'DESARROLLADOR'), ctrl.crear);
router.put('/:id', authorize('ADMINISTRADOR', 'DESARROLLADOR'), ctrl.actualizar);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
