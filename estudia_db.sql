-- =====================================================================
-- Datos de prueba (INSERT) — ESTUD-IA
-- Se insertan en el mismo orden de dependencia de claves foráneas
-- =====================================================================
USE estudia_db;
GO

-- USUARIO (16: 1 administrador, 3 docentes, 10 estudiantes, 2 desarrolladores)
SET IDENTITY_INSERT USUARIO ON;
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (1, N'Gustavo', N'García Chuchón', N'gustavo.garcia@estudia.pe', N'hash$Adm2026', N'966111222', N'ADMINISTRADOR', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (2, N'Leydy', N'Jaico Quispe', N'leydy.jaico@estudia.pe', N'hash$Doc2026', N'966111223', N'DOCENTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (3, N'Mateo', N'Huamán Rojas', N'mateo.huaman@gmail.com', N'hash$Est2026', N'966111224', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (4, N'Valeria', N'Ccasa Torres', N'valeria.ccasa@gmail.com', N'hash$Est2026', N'966111225', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (5, N'Rodrigo', N'Pillaca Cabrera', N'rodrigo.pillaca@estudia.pe', N'hash$Dev2026', N'966111226', N'DESARROLLADOR', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (6, N'Carlos', N'Mendoza Quispe', N'carlos.mendoza@estudia.pe', N'hash$Doc2026b', N'966111227', N'DOCENTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (7, N'Fiorella', N'Ochoa Bautista', N'fiorella.ochoa@estudia.pe', N'hash$Doc2026c', N'966111228', N'DOCENTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (8, N'Camila', N'Flores Ríos', N'camila.flores@gmail.com', N'hash$Est2026b', N'966111229', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (9, N'Diego', N'Flores Ríos', N'diego.flores@gmail.com', N'hash$Est2026c', N'966111230', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (10, N'Ariana', N'Quispe Palomino', N'ariana.quispe@gmail.com', N'hash$Est2026d', N'966111231', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (11, N'Bruno', N'Salazar Tineo', N'bruno.salazar@gmail.com', N'hash$Est2026e', N'966111232', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (12, N'Fabricio', N'Núñez Aroni', N'fabricio.nunez@gmail.com', N'hash$Est2026f', N'966111233', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (13, N'Milagros', N'Cárdenas Soto', N'milagros.cardenas@gmail.com', N'hash$Est2026g', N'966111234', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (14, N'Ismael', N'Palomino Vega', N'ismael.palomino@gmail.com', N'hash$Est2026h', N'966111235', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (15, N'Yamile', N'Torres Quicaña', N'yamile.torres@gmail.com', N'hash$Est2026i', N'966111236', N'ESTUDIANTE', DEFAULT);
INSERT INTO USUARIO (idUsuario, nombres, apellidos, correo, contrasena, telefono, rol, fechaRegistro) VALUES (16, N'Kevin', N'Ramos Huamán', N'kevin.ramos@estudia.pe', N'hash$Dev2026b', N'966111237', N'DESARROLLADOR', DEFAULT);
SET IDENTITY_INSERT USUARIO OFF;
GO

-- CURSO (4)
SET IDENTITY_INSERT CURSO ON;
INSERT INTO CURSO (idCurso, nombreCurso, descripcion, duracion, precio) VALUES (1, N'Introducción a la Inteligencia Artificial', N'Fundamentos de IA para nivel escolar', 8, 250);
INSERT INTO CURSO (idCurso, nombreCurso, descripcion, duracion, precio) VALUES (2, N'Programación con Python Jr.', N'Introducción a la programación aplicada a IA', 10, 300);
INSERT INTO CURSO (idCurso, nombreCurso, descripcion, duracion, precio) VALUES (3, N'Robótica educativa con IA', N'Sensores, actuadores y programación de robots básicos', 8, 280);
INSERT INTO CURSO (idCurso, nombreCurso, descripcion, duracion, precio) VALUES (4, N'Diseño de videojuegos con IA', N'Diseño, mecánicas y arte de videojuegos asistido por IA', 12, 350);
SET IDENTITY_INSERT CURSO OFF;
GO

-- GRUPO (6)
SET IDENTITY_INSERT GRUPO ON;
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (1, 1, 2, N'IA-9-11-A', N'2026-04-05', N'2026-06-05', N'Sábados 9:00-11:00', 15, N'EN_CURSO');
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (2, 2, 2, N'PY-12-14-A', N'2026-04-06', N'2026-06-06', N'Sábados 15:00-17:00', 15, N'PROGRAMADO');
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (3, 1, 6, N'IA-12-14-A', N'2026-04-05', N'2026-06-05', N'Domingos 10:00-12:00', 12, N'EN_CURSO');
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (4, 3, 6, N'ROB-9-11-A', N'2026-04-06', N'2026-06-06', N'Domingos 9:00-11:00', 12, N'PROGRAMADO');
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (5, 3, 7, N'ROB-15-16-A', N'2026-04-05', N'2026-06-05', N'Sábados 17:00-19:00', 12, N'EN_CURSO');
INSERT INTO GRUPO (idGrupo, idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado) VALUES (6, 4, 7, N'GAME-15-16-A', N'2026-03-01', N'2026-04-30', N'Domingos 15:00-18:00', 10, N'FINALIZADO');
SET IDENTITY_INSERT GRUPO OFF;
GO

-- ADMINISTRADOR
INSERT INTO ADMINISTRADOR (idUsuario, cargo, permisos) VALUES (1, N'Administrador General', N'Gestión total del sistema');
GO

-- ESTUDIANTE (10)
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (3, N'72451188', 1);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (4, N'73562299', 1);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (8, N'74123456', 1);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (9, N'74123457', 1);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (10, N'75234567', 2);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (11, N'75234568', 2);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (12, N'76345678', 3);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (13, N'77456789', 4);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (14, N'78567890', 5);
INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (15, N'79678901', 6);
GO

-- APODERADO (10: Camila y Diego son hermanos y comparten apoderada)
SET IDENTITY_INSERT APODERADO ON;
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (1, 3, N'Rosa', N'Rojas Medina', N'Madre', N'Jr. Libertad 245, Ayacucho', N'966222333');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (2, 4, N'Julio', N'Torres Vega', N'Padre', N'Av. Mariscal Cáceres 512, Ayacucho', N'966222334');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (3, 8, N'Elena', N'Ríos Palma', N'Madre', N'Jr. Grau 310, Ayacucho', N'966222335');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (4, 9, N'Elena', N'Ríos Palma', N'Madre', N'Jr. Grau 310, Ayacucho', N'966222335');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (5, 10, N'Walter', N'Quispe Ñahui', N'Padre', N'Av. Independencia 88, Ayacucho', N'966222336');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (6, 11, N'Karina', N'Tineo Ccama', N'Madre', N'Psje. Bolognesi 120, Ayacucho', N'966222337');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (7, 12, N'Edwin', N'Aroni Palomino', N'Padre', N'Jr. San Martín 245, Ayacucho', N'966222338');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (8, 13, N'Norma', N'Soto Huamán', N'Madre', N'Av. Cusco 400, Ayacucho', N'966222339');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (9, 14, N'Percy', N'Vega Ttito', N'Padre', N'Jr. Arequipa 150, Ayacucho', N'966222340');
INSERT INTO APODERADO (idApoderado, idEstudiante, nombre, apellidos, parentesco, direccion, celular) VALUES (10, 15, N'Rocío', N'Quicaña Ttito', N'Madre', N'Av. Sucre 275, Ayacucho', N'966222341');
SET IDENTITY_INSERT APODERADO OFF;
GO

-- SESION (17)
SET IDENTITY_INSERT SESION ON;
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (1, 1, N'2026-04-05', N'09:00', N'11:00', N'PRESENCIAL', N'Introducción a la IA', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (2, 1, N'2026-04-12', N'09:00', N'11:00', N'PRESENCIAL', N'Aprendizaje automático básico', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (3, 1, N'2026-04-19', N'09:00', N'11:00', N'PRESENCIAL', N'Visión por computadora para niños', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (4, 1, N'2026-04-26', N'09:00', N'11:00', N'PRESENCIAL', N'Proyecto final: mi primer chatbot', N'PROGRAMADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (5, 2, N'2026-04-06', N'15:00', N'17:00', N'PRESENCIAL', N'Variables y tipos de datos', N'PROGRAMADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (6, 2, N'2026-04-13', N'15:00', N'17:00', N'PRESENCIAL', N'Estructuras de control', N'PROGRAMADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (7, 3, N'2026-04-05', N'10:00', N'12:00', N'VIRTUAL', N'Fundamentos de IA para adolescentes', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (8, 3, N'2026-04-12', N'10:00', N'12:00', N'VIRTUAL', N'Ética y sesgos en IA', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (9, 3, N'2026-04-19', N'10:00', N'12:00', N'VIRTUAL', N'Proyecto: clasificador de imágenes', N'PROGRAMADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (10, 4, N'2026-04-06', N'09:00', N'11:00', N'PRESENCIAL', N'Introducción a la robótica educativa', N'PROGRAMADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (11, 5, N'2026-04-05', N'17:00', N'19:00', N'PRESENCIAL', N'Sensores y actuadores', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (12, 5, N'2026-04-12', N'17:00', N'19:00', N'PRESENCIAL', N'Programación de microcontroladores', N'CANCELADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (13, 5, N'2026-04-19', N'17:00', N'19:00', N'PRESENCIAL', N'Montaje de robot seguidor de línea', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (14, 6, N'2026-03-01', N'15:00', N'18:00', N'VIRTUAL', N'Diseño de niveles', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (15, 6, N'2026-03-08', N'15:00', N'18:00', N'VIRTUAL', N'Programación de mecánicas de juego', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (16, 6, N'2026-03-15', N'15:00', N'18:00', N'VIRTUAL', N'Arte y sonido', N'DICTADA');
INSERT INTO SESION (idSesion, idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado) VALUES (17, 6, N'2026-03-22', N'15:00', N'18:00', N'VIRTUAL', N'Presentación final de proyectos', N'DICTADA');
SET IDENTITY_INSERT SESION OFF;
GO

-- MATRICULA (11: Fabricio se retiró de PY-12-14-A y reingresó a IA-12-14-A)
SET IDENTITY_INSERT MATRICULA ON;
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (1, 3, 1, DEFAULT, N'ACTIVA', N'Pago en 2 cuotas');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (2, 4, 1, DEFAULT, N'ACTIVA', N'Pago al contado');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (3, 8, 1, DEFAULT, N'ACTIVA', N'Pago en 2 cuotas');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (4, 9, 1, DEFAULT, N'ACTIVA', N'Pago al contado, cuota pendiente de verificación');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (5, 10, 2, DEFAULT, N'ACTIVA', N'Pago al contado');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (6, 11, 2, DEFAULT, N'ACTIVA', N'Pago pendiente de verificación');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (7, 12, 2, N'2026-02-01', N'RETIRADA', N'Se retiró antes de iniciar el ciclo');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (8, 12, 3, DEFAULT, N'ACTIVA', N'Reingresó al grupo de IA 12-14');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (9, 13, 4, DEFAULT, N'ACTIVA', N'Pago al contado');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (10, 14, 5, DEFAULT, N'ACTIVA', N'Pago al contado');
INSERT INTO MATRICULA (idMatricula, idEstudiante, idGrupo, fechaMatricula, estadoMatricula, observaciones) VALUES (11, 15, 6, N'2026-03-01', N'FINALIZADA', N'Curso concluido satisfactoriamente');
SET IDENTITY_INSERT MATRICULA OFF;
GO

-- ASISTENCIA (20)
SET IDENTITY_INSERT ASISTENCIA ON;
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (1, 1, 3, N'2026-04-05', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (2, 1, 4, N'2026-04-05', N'TARDANZA', N'Llegó 10 minutos tarde');
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (3, 1, 8, N'2026-04-05', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (4, 1, 9, N'2026-04-05', N'AUSENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (5, 2, 3, N'2026-04-12', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (6, 2, 4, N'2026-04-12', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (7, 2, 8, N'2026-04-12', N'JUSTIFICADO', N'Cita médica');
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (8, 2, 9, N'2026-04-12', N'AUSENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (9, 3, 3, N'2026-04-19', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (10, 3, 4, N'2026-04-19', N'TARDANZA', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (11, 3, 8, N'2026-04-19', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (12, 3, 9, N'2026-04-19', N'AUSENTE', N'Tercera falta consecutiva');
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (13, 7, 12, N'2026-04-05', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (14, 8, 12, N'2026-04-12', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (15, 11, 14, N'2026-04-05', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (16, 13, 14, N'2026-04-19', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (17, 14, 15, N'2026-03-01', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (18, 15, 15, N'2026-03-08', N'PRESENTE', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (19, 16, 15, N'2026-03-15', N'TARDANZA', NULL);
INSERT INTO ASISTENCIA (idAsistencia, idSesion, idEstudiante, fecha, estadoAsistencia, observacion) VALUES (20, 17, 15, N'2026-03-22', N'PRESENTE', NULL);
SET IDENTITY_INSERT ASISTENCIA OFF;
GO

-- NOTA (16)
SET IDENTITY_INSERT NOTA ON;
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (1, 3, 1, N'Práctica 1', 17.5, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (2, 3, 1, N'Práctica 2', 16, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (3, 3, 1, N'Examen final', 18, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (4, 4, 1, N'Práctica 1', 15, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (5, 4, 1, N'Práctica 2', 12, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (6, 8, 1, N'Práctica 1', 14, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (7, 8, 1, N'Práctica 2', 16, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (8, 9, 1, N'Práctica 1', 8, N'Requiere refuerzo', DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (9, 9, 1, N'Práctica 2', 9, N'Requiere refuerzo', DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (10, 12, 1, N'Práctica 1', 17, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (11, 12, 1, N'Práctica 2', 15, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (12, 14, 3, N'Práctica 1', 19, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (13, 14, 3, N'Práctica 2', 18, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (14, 15, 4, N'Práctica 1', 16, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (15, 15, 4, N'Práctica 2', 17, NULL, DEFAULT);
INSERT INTO NOTA (idNota, idEstudiante, idCurso, tipoEvaluacion, nota, observacion, fechaRegistro) VALUES (16, 15, 4, N'Proyecto final', 18, NULL, DEFAULT);
SET IDENTITY_INSERT NOTA OFF;
GO

-- TAREA (4)
SET IDENTITY_INSERT TAREA ON;
INSERT INTO TAREA (idTarea, idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado) VALUES (1, 1, N'Mapa conceptual de IA', N'Elaborar un mapa conceptual sobre tipos de IA', N'2026-04-05', N'2026-04-12', NULL, N'CERRADA');
INSERT INTO TAREA (idTarea, idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado) VALUES (2, 1, N'Ensayo: impacto de la IA en la educación', N'Redactar un ensayo corto con ejemplos locales', N'2026-04-19', N'2026-04-26', NULL, N'ABIERTA');
INSERT INTO TAREA (idTarea, idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado) VALUES (3, 3, N'Boceto de circuito con sensores', N'Diseñar en papel un circuito con al menos dos sensores', N'2026-04-05', N'2026-04-19', NULL, N'ABIERTA');
INSERT INTO TAREA (idTarea, idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado) VALUES (4, 4, N'Documento de diseño de juego (GDD)', N'Elaborar el documento de diseño del videojuego final', N'2026-03-01', N'2026-03-15', NULL, N'CERRADA');
SET IDENTITY_INSERT TAREA OFF;
GO

-- ENTREGA_TAREA (7: Diego no llegó a entregar la Tarea 1)
SET IDENTITY_INSERT ENTREGA_TAREA ON;
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (1, 1, 3, N'entrega_mateo_t1.pdf', DEFAULT, 18, N'CALIFICADA', NULL);
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (2, 1, 4, N'entrega_valeria_t1.pdf', DEFAULT, 16, N'CALIFICADA', NULL);
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (3, 1, 8, N'entrega_camila_t1.pdf', DEFAULT, 15, N'CALIFICADA', NULL);
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (4, 1, 12, N'entrega_fabricio_t1.pdf', DEFAULT, 17, N'CALIFICADA', NULL);
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (5, 2, 3, N'entrega_mateo_t2.pdf', DEFAULT, NULL, N'ENTREGADA', NULL);
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (6, 3, 14, N'entrega_ismael_t3.pdf', DEFAULT, NULL, N'FUERA_DE_PLAZO', N'Entregado 2 días después del plazo');
INSERT INTO ENTREGA_TAREA (idEntrega, idTarea, idEstudiante, archivoEntregado, fechaEntrega, calificacion, estado, observacion) VALUES (7, 4, 15, N'entrega_yamile_t4.pdf', DEFAULT, 19, N'CALIFICADA', N'Excelente documento de diseño');
SET IDENTITY_INSERT ENTREGA_TAREA OFF;
GO

-- CLIENTE (4)
SET IDENTITY_INSERT CLIENTE ON;
INSERT INTO CLIENTE (idCliente, ruc, representante, correo, direccion, telefono, estadoCliente) VALUES (1, N'20601234567', N'Sofía Ramírez', N'contacto@edutechperu.pe', N'Av. Argentina 450, Ayacucho', N'966333444', N'ACTIVO');
INSERT INTO CLIENTE (idCliente, ruc, representante, correo, direccion, telefono, estadoCliente) VALUES (2, N'20198765432', N'Jorge Balvín Cárdenas', N'contacto@munihuamanga.gob.pe', N'Jr. Asamblea 300, Ayacucho', N'966333445', N'ACTIVO');
INSERT INTO CLIENTE (idCliente, ruc, representante, correo, direccion, telefono, estadoCliente) VALUES (3, N'20456789123', N'Milagros Chávez Peña', N'administracion@colegiolosandes.edu.pe', N'Av. Cusco 620, Ayacucho', N'966333446', N'ACTIVO');
INSERT INTO CLIENTE (idCliente, ruc, representante, correo, direccion, telefono, estadoCliente) VALUES (4, N'20334455667', N'Renato Escobar Díaz', N'contacto@futurodigital.org', N'Jr. Libertad 90, Ayacucho', N'966333447', N'INACTIVO');
SET IDENTITY_INSERT CLIENTE OFF;
GO

-- PROPUESTA (6)
SET IDENTITY_INSERT PROPUESTA ON;
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (1, 1, N'Chatbot de atención a postulantes', 4500, N'2026-04-01', N'2026-04-10', N'APROBADA');
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (2, 2, N'Sistema de gestión de trámites municipales con IA', 12000, N'2026-03-15', N'2026-03-28', N'APROBADA');
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (3, 3, N'Plataforma de tutoría virtual con IA para el colegio', 6500, N'2026-01-10', N'2026-01-20', N'APROBADA');
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (4, 3, N'Módulo de análisis predictivo de deserción escolar', 3800, N'2026-06-01', NULL, N'PENDIENTE');
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (5, 4, N'Chatbot de atención al donante', 2900, N'2026-02-01', N'2026-02-15', N'RECHAZADA');
INSERT INTO PROPUESTA (idPropuesta, idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado) VALUES (6, 2, N'Dashboard de indicadores educativos municipales', 5200, N'2026-06-10', NULL, N'PENDIENTE');
SET IDENTITY_INSERT PROPUESTA OFF;
GO

-- SERVICIO (3: solo las propuestas APROBADAS se convierten en servicio)
SET IDENTITY_INSERT SERVICIO ON;
INSERT INTO SERVICIO (idServicio, idPropuesta, idCliente, nombreServicio, descripcion, precio, estado) VALUES (1, 1, 1, N'Chatbot institucional EduTech Perú', N'Chatbot con IA para atención de consultas', 4500, N'ACTIVO');
INSERT INTO SERVICIO (idServicio, idPropuesta, idCliente, nombreServicio, descripcion, precio, estado) VALUES (2, 2, 2, N'Sistema de gestión de trámites municipales', N'Automatización de trámites con IA', 12000, N'ACTIVO');
INSERT INTO SERVICIO (idServicio, idPropuesta, idCliente, nombreServicio, descripcion, precio, estado) VALUES (3, 3, 3, N'Plataforma de tutoría virtual - Colegio Los Andes', N'Tutoría virtual asistida por IA', 6500, N'FINALIZADO');
SET IDENTITY_INSERT SERVICIO OFF;
GO

-- CONTRATO (3)
SET IDENTITY_INSERT CONTRATO ON;
INSERT INTO CONTRATO (idContrato, idServicio, idCliente, monto, fechaFin, estadoContratado, archivoContrato) VALUES (1, 1, 1, 4500, N'2026-10-01', N'VIGENTE', N'contrato_edutech_001.pdf');
INSERT INTO CONTRATO (idContrato, idServicio, idCliente, monto, fechaFin, estadoContratado, archivoContrato) VALUES (2, 2, 2, 12000, N'2027-03-15', N'VIGENTE', N'contrato_muni_huamanga_001.pdf');
INSERT INTO CONTRATO (idContrato, idServicio, idCliente, monto, fechaFin, estadoContratado, archivoContrato) VALUES (3, 3, 3, 6500, N'2026-01-20', N'CERRADO', N'contrato_colegio_andes_001.pdf');
SET IDENTITY_INSERT CONTRATO OFF;
GO

-- PROYECTO (5)
SET IDENTITY_INSERT PROYECTO ON;
INSERT INTO PROYECTO (idProyecto, nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio) VALUES (1, N'Detector de plagio académico con IA', N'Prototipo para detectar similitud textual en trabajos escolares', N'Sistema de análisis de texto', N'2026-04-01', N'2026-07-01', N'DESARROLLO', N'https://github.com/estudia-labs/detector-plagio');
INSERT INTO PROYECTO (idProyecto, nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio) VALUES (2, N'Chatbot tutor de matemáticas', N'Asistente conversacional para reforzamiento de matemática escolar', N'Asistente conversacional educativo', N'2026-04-15', N'2026-08-01', N'DESARROLLO', N'https://github.com/estudia-labs/tutor-matematicas');
INSERT INTO PROYECTO (idProyecto, nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio) VALUES (3, N'App de gamificación para asistencia escolar', N'Aplicación móvil que premia la asistencia puntual', N'Aplicación móvil', N'2026-05-01', N'2026-09-15', N'DISENO', NULL);
INSERT INTO PROYECTO (idProyecto, nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio) VALUES (4, N'Sistema de reconocimiento de emociones en clase', N'Análisis de video para detectar niveles de atención', N'Visión por computadora', N'2026-02-01', N'2026-06-15', N'PRUEBAS', N'https://github.com/estudia-labs/emociones-clase');
INSERT INTO PROYECTO (idProyecto, nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio) VALUES (5, N'Recomendador de rutas de aprendizaje personalizadas', N'Motor de recomendación de contenidos según el avance del estudiante', N'Sistema de recomendación', N'2025-11-01', N'2026-03-01', N'FINALIZADO', N'https://github.com/estudia-labs/rutas-aprendizaje');
SET IDENTITY_INSERT PROYECTO OFF;
GO

-- INTEGRANTE_PROYECTO (9)
SET IDENTITY_INSERT INTEGRANTE_PROYECTO ON;
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (1, 5, 1, DEFAULT, N'Desarrollador principal');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (2, 16, 1, DEFAULT, N'Desarrollador de soporte');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (3, 16, 2, DEFAULT, N'Desarrollador principal');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (4, 14, 2, DEFAULT, N'Estudiante colaborador');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (5, 5, 3, DEFAULT, N'Desarrollador principal');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (6, 5, 4, DEFAULT, N'Desarrollador principal');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (7, 16, 4, DEFAULT, N'Tester');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (8, 16, 5, DEFAULT, N'Desarrollador principal');
INSERT INTO INTEGRANTE_PROYECTO (idIntegrante, idUsuario, idProyecto, fechaAsignacion, rolProyecto) VALUES (9, 5, 5, DEFAULT, N'Revisor técnico');
SET IDENTITY_INSERT INTEGRANTE_PROYECTO OFF;
GO

-- PAGO (18: matrícula 1-13, servicios 14-18)
SET IDENTITY_INSERT PAGO ON;
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (1, 3, 1, NULL, 125, N'YAPE', N'yape_mateo_cuota1.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (2, 3, 1, NULL, 125, N'YAPE', N'yape_mateo_cuota2.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (3, 4, 2, NULL, 250, N'TRANSFERENCIA', N'transf_valeria_001.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (4, 8, 3, NULL, 125, N'YAPE', N'yape_camila_cuota1.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (5, 8, 3, NULL, 125, N'YAPE', N'yape_camila_cuota2.jpg', DEFAULT, N'PENDIENTE', NULL);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (6, 9, 4, NULL, 250, N'EFECTIVO', N'efectivo_diego_001.jpg', DATEADD(DAY, -3, SYSDATETIME()), N'PENDIENTE', NULL);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (7, 10, 5, NULL, 300, N'YAPE', N'yape_ariana_001.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (8, 11, 6, NULL, 300, N'TRANSFERENCIA', N'transf_bruno_001.jpg', DEFAULT, N'PENDIENTE', NULL);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (9, 12, 8, NULL, 250, N'YAPE', N'yape_fabricio_001.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (10, 13, 9, NULL, 280, N'PLIN', N'plin_milagros_001.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (11, 14, 10, NULL, 280, N'YAPE', N'yape_ismael_001.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (12, 15, 11, NULL, 175, N'TRANSFERENCIA', N'transf_yamile_cuota1.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (13, 15, 11, NULL, 175, N'TRANSFERENCIA', N'transf_yamile_cuota2.jpg', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (14, 1, NULL, 1, 2250, N'TRANSFERENCIA', N'transf_edutech_hito1.pdf', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (15, 1, NULL, 1, 2250, N'TRANSFERENCIA', N'transf_edutech_hito2.pdf', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (16, 1, NULL, 2, 6000, N'TRANSFERENCIA', N'transf_muni_hito1.pdf', DEFAULT, N'PAGADO', DEFAULT);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (17, 1, NULL, 2, 6000, N'TRANSFERENCIA', N'transf_muni_hito2.pdf', DEFAULT, N'PENDIENTE', NULL);
INSERT INTO PAGO (idPago, idUsuario, idMatricula, idServicio, monto, medioPago, comprobante, fechaPago, estadoPago, fechaVerificacion) VALUES (18, 1, NULL, 3, 6500, N'TRANSFERENCIA', N'transf_colegio_final.pdf', DEFAULT, N'PAGADO', DEFAULT);
SET IDENTITY_INSERT PAGO OFF;
GO

-- COMUNICACION (14: 9 vinculadas a usuario, 5 vinculadas a cliente)
SET IDENTITY_INSERT COMUNICACION ON;
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (1, 3, NULL, N'CONSULTA', N'Consulta por horario de recuperación', N'Estudiante preguntó por clase perdida.', N'WhatsApp', DEFAULT, N'RESUELTO', 1.5);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (2, 4, NULL, N'CONSULTA', N'Pregunta sobre certificado', N'Consulta si ya puede solicitar su certificado digital.', N'WhatsApp', DEFAULT, N'ABIERTO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (3, 8, NULL, N'ALERTA', N'Alerta de inasistencia', N'La estudiante acumula una falta justificada y una tardanza.', N'Sistema', DEFAULT, N'ASIGNADO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (4, 9, NULL, N'ALERTA', N'Bajo rendimiento académico', N'El estudiante registra notas por debajo del promedio aprobatorio.', N'Sistema', DEFAULT, N'ABIERTO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (5, 9, NULL, N'SEGUIMIENTO', N'Seguimiento de tutoría', N'Se deriva a tutoría académica por bajo rendimiento y ausentismo.', N'Correo', DEFAULT, N'ASIGNADO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (6, 11, NULL, N'CONSULTA', N'Consulta sobre cuota pendiente', N'Pregunta por el estado de verificación de su pago.', N'WhatsApp', DEFAULT, N'RESUELTO', 0.5);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (7, 14, NULL, N'SEGUIMIENTO', N'Seguimiento de proyecto Labs', N'Coordinación de avances del proyecto de reconocimiento de emociones.', N'Correo', DEFAULT, N'ASIGNADO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (8, 15, NULL, N'CONSULTA', N'Consulta sobre certificado', N'Consulta ya resuelta sobre la emisión de su certificado.', N'WhatsApp', DEFAULT, N'CERRADO', 1.0);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (9, 12, NULL, N'CONSULTA', N'Consulta por reingreso al programa', N'Consulta sobre su reingreso al grupo de IA 12-14.', N'WhatsApp', DEFAULT, N'ABIERTO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (10, NULL, 1, N'TICKET_SOPORTE', N'Error en respuestas del chatbot', N'El chatbot no reconoce preguntas frecuentes sobre matrícula.', N'Correo', DEFAULT, N'RESUELTO', 2.0);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (11, NULL, 1, N'TICKET_SOPORTE', N'Solicitud de nuevo flujo de conversación', N'El cliente solicita agregar un flujo para consultas de pago.', N'Correo', DEFAULT, N'ABIERTO', NULL);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (12, NULL, 2, N'TICKET_SOPORTE', N'Caída del sistema de trámites', N'El sistema no responde desde las 8:00 a. m.', N'Teléfono', DEFAULT, N'RESUELTO', 4.5);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (13, NULL, 3, N'TICKET_SOPORTE', N'Error al generar reportes de tutoría', N'El módulo de reportes muestra datos incompletos.', N'Correo', DEFAULT, N'RESUELTO', 1.0);
INSERT INTO COMUNICACION (idComunicacion, idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, fecha, estado, tiempoAtencionHoras) VALUES (14, NULL, 2, N'CONSULTA', N'Consulta sobre nueva propuesta', N'El cliente pregunta por el estado de la propuesta de dashboard.', N'Correo', DEFAULT, N'RESUELTO', NULL);
SET IDENTITY_INSERT COMUNICACION OFF;
GO

-- NOTIFICACION (13)
SET IDENTITY_INSERT NOTIFICACION ON;
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (1, 3, N'Recordatorio de clase', N'Tu próxima sesión es el sábado 26 de abril a las 9:00 a. m.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (2, 3, N'Certificado disponible', N'Tu certificado digital ya puede ser generado.', DEFAULT, N'LEIDA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (3, 4, N'Recordatorio de pago', N'Tu matrícula está al día. ¡Gracias!', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (4, 8, N'Nueva tarea publicada', N'Se publicó una nueva tarea en tu curso.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (5, 9, N'Alerta académica', N'Se generó una alerta por tu rendimiento reciente.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (6, 10, N'Bienvenida al grupo', N'Bienvenida al grupo PY-12-14-A.', DEFAULT, N'LEIDA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (7, 11, N'Recordatorio de cuota pendiente', N'Tienes una cuota pendiente de verificación.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (8, 12, N'Reingreso confirmado', N'Tu reingreso al grupo IA-12-14-A fue confirmado.', DEFAULT, N'LEIDA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (9, 13, N'Bienvenida al grupo', N'Bienvenida al grupo ROB-9-11-A.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (10, 14, N'Certificado disponible', N'Tu certificado digital ya puede ser generado.', DEFAULT, N'ENVIADA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (11, 15, N'Certificado disponible', N'Tu certificado digital ya puede ser generado.', DEFAULT, N'LEIDA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (12, 6, N'Asignación de grupo', N'Se te asignó el grupo ROB-9-11-A.', DEFAULT, N'LEIDA');
INSERT INTO NOTIFICACION (idNotificacion, idUsuario, titulo, descripcion, fecha, estadoNotificacion) VALUES (13, 7, N'Asignación de grupo', N'Se te asignó el grupo ROB-15-16-A.', DEFAULT, N'LEIDA');
SET IDENTITY_INSERT NOTIFICACION OFF;
GO

-- REPORTE (4)
SET IDENTITY_INSERT REPORTE ON;
INSERT INTO REPORTE (idReporte, tipoReporte, fechaGeneracion, generadoPor, archivoReporte) VALUES (1, N'Estudiantes activos por curso', DEFAULT, 1, N'reporte_activos_abril2026.pdf');
INSERT INTO REPORTE (idReporte, tipoReporte, fechaGeneracion, generadoPor, archivoReporte) VALUES (2, N'Reporte financiero mensual', DEFAULT, 1, N'reporte_financiero_abril2026.pdf');
INSERT INTO REPORTE (idReporte, tipoReporte, fechaGeneracion, generadoPor, archivoReporte) VALUES (3, N'Asistencia por grupo', DEFAULT, 2, N'reporte_asistencia_ia911_abril2026.pdf');
INSERT INTO REPORTE (idReporte, tipoReporte, fechaGeneracion, generadoPor, archivoReporte) VALUES (4, N'Avance de proyectos Labs', DEFAULT, 5, N'reporte_avance_labs_abril2026.pdf');
SET IDENTITY_INSERT REPORTE OFF;
GO

-- MENSAJE_CONTACTO (5)
SET IDENTITY_INSERT MENSAJE_CONTACTO ON;
INSERT INTO MENSAJE_CONTACTO (idMensaje, nombre, telefono, correo, mensaje, fechaEnvio, estadoMensaje) VALUES (1, N'Marco Loayza', N'966555666', N'marco.loayza@gmail.com', N'Quisiera información sobre el curso de Python para mi hijo.', DEFAULT, N'NUEVO');
INSERT INTO MENSAJE_CONTACTO (idMensaje, nombre, telefono, correo, mensaje, fechaEnvio, estadoMensaje) VALUES (2, N'Diana Quicaña Ttito', N'966555667', N'diana.quicana@gmail.com', N'Quisiera saber si tienen el curso de robótica para mi hija de 10 años.', DEFAULT, N'ATENDIDO');
INSERT INTO MENSAJE_CONTACTO (idMensaje, nombre, telefono, correo, mensaje, fechaEnvio, estadoMensaje) VALUES (3, N'Percy Aguilar Chuchón', N'966555668', N'percy.aguilar@gmail.com', N'¿Tienen convenios con colegios para el área de Labs?', DEFAULT, N'NUEVO');
INSERT INTO MENSAJE_CONTACTO (idMensaje, nombre, telefono, correo, mensaje, fechaEnvio, estadoMensaje) VALUES (4, N'Nilda Espinoza Ramos', N'966555669', N'nilda.espinoza@gmail.com', N'Consulto por becas o descuentos para hermanos matriculados.', DEFAULT, N'ATENDIDO');
INSERT INTO MENSAJE_CONTACTO (idMensaje, nombre, telefono, correo, mensaje, fechaEnvio, estadoMensaje) VALUES (5, N'Josué Ramírez Sulca', N'966555670', N'josue.ramirez@gmail.com', N'Quiero información sobre el curso de diseño de videojuegos.', DEFAULT, N'NUEVO');
SET IDENTITY_INSERT MENSAJE_CONTACTO OFF;
GO
