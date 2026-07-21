require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const cursoRoutes = require('./routes/curso.routes');
const grupoRoutes = require('./routes/grupo.routes');
const sesionRoutes = require('./routes/sesion.routes');
const matriculaRoutes = require('./routes/matricula.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const notaRoutes = require('./routes/nota.routes');
const tareaRoutes = require('./routes/tarea.routes');
const entregaRoutes = require('./routes/entrega.routes');
const clienteRoutes = require('./routes/cliente.routes');
const propuestaRoutes = require('./routes/propuesta.routes');
const servicioRoutes = require('./routes/servicio.routes');
const contratoRoutes = require('./routes/contrato.routes');
const proyectoRoutes = require('./routes/proyecto.routes');
const integranteRoutes = require('./routes/integrante.routes');
const pagoRoutes = require('./routes/pago.routes');
const comunicacionRoutes = require('./routes/comunicacion.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const mensajeContactoRoutes = require('./routes/mensajeContacto.routes');
const reporteRoutes = require('./routes/reporte.routes');
const reportesConsultasRoutes = require('./routes/reportesConsultas.routes');
const academicoRoutes = require('./routes/academico.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'estudia-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/propuestas', propuestaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/integrantes', integranteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/comunicaciones', comunicacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/mensajes-contacto', mensajeContactoRoutes);
app.use('/api/reportes-generados', reporteRoutes);
app.use('/api/reportes', reportesConsultasRoutes);
app.use('/api/academico', academicoRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API ESTUD-IA escuchando en el puerto ${PORT}`);
});
