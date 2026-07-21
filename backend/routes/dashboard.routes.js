const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const {
  dashboardEstudiante,
  dashboardDocente,
  dashboardDesarrollador,
  dashboardAdministrador
} = require('../controllers/dashboard.controller');

router.get('/estudiante', verifyToken, authorize('ESTUDIANTE'), dashboardEstudiante);
router.get('/docente', verifyToken, authorize('DOCENTE'), dashboardDocente);
router.get('/desarrollador', verifyToken, authorize('DESARROLLADOR'), dashboardDesarrollador);
router.get('/administrador', verifyToken, authorize('ADMINISTRADOR'), dashboardAdministrador);

module.exports = router;
