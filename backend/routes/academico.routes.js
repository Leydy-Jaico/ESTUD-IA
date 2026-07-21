const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academico.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/:idEstudiante/estado', ctrl.estadoAcademico);
router.get('/:idEstudiante/certificado', ctrl.emitirCertificado);

module.exports = router;
