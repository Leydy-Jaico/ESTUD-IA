const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesConsultas.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken, authorize('ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'));

router.get('/estudiantes-apoderado', ctrl.estudiantesConApoderado);
router.get('/porcentaje-asistencia', ctrl.porcentajeAsistencia);
router.get('/entregas-pendientes', ctrl.entregasPendientes);
router.get('/proyectos-en-desarrollo', ctrl.proyectosEnDesarrollo);
router.get('/clientes-servicios-activos', ctrl.clientesConServiciosActivos);
router.get('/cuotas-pendientes', ctrl.estudiantesConCuotasPendientes);
router.get('/comunicaciones-abiertas', ctrl.comunicacionesAbiertasPorUsuario);
router.get('/docentes-grupos', ctrl.docentesActivosConGrupos);
router.get('/aptos-certificacion', ctrl.estudiantesAptosCertificacion);
router.get('/tiempo-atencion-tickets', ctrl.tiempoPromedioAtencionTickets);

module.exports = router;
