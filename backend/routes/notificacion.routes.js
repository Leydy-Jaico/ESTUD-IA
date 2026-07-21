const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacion.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', authorize('ADMINISTRADOR'), ctrl.crear);
router.put('/:id/leer', ctrl.marcarLeida);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
