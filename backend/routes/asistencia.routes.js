const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asistencia.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.listar);
router.post('/', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.crear);
router.post('/sesion/:idSesion/masivo', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.registrarMasivo);
router.put('/:id', authorize('ADMINISTRADOR', 'DOCENTE'), ctrl.actualizar);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.eliminar);

module.exports = router;
