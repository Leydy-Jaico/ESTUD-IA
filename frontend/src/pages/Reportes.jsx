import { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';

const REPORTES = [
  {
    key: 'estudiantes-apoderado',
    titulo: '1. Estudiantes con su apoderado',
    columns: [
      { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'dni', label: 'DNI' },
      { key: 'nombreApoderado', label: 'Apoderado', render: (r) => r.nombreApoderado ? `${r.nombreApoderado} ${r.apellidosApoderado}` : '— sin registrar —' },
      { key: 'parentesco', label: 'Parentesco' },
      { key: 'celular', label: 'Celular' }
    ]
  },
  {
    key: 'porcentaje-asistencia',
    titulo: '2. % de asistencia por estudiante y grupo',
    columns: [
      { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'nombreGrupo', label: 'Grupo' },
      { key: 'totalSesionesRegistradas', label: 'Sesiones registradas' },
      { key: 'asistencias', label: 'Asistencias' },
      { key: 'porcentajeAsistencia', label: '% Asistencia', render: (r) => `${r.porcentajeAsistencia}%` }
    ]
  },
  {
    key: 'entregas-pendientes',
    titulo: '3. Entregas pendientes de calificar',
    columns: [
      { key: 'titulo', label: 'Tarea' },
      { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'fechaEntrega', label: 'Entregado', render: (r) => new Date(r.fechaEntrega).toLocaleString() },
      { key: 'estado', label: 'Estado' }
    ]
  },
  {
    key: 'proyectos-en-desarrollo',
    titulo: '4. Proyectos Labs en desarrollo y su equipo',
    columns: [
      { key: 'nombreProyecto', label: 'Proyecto' },
      { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) },
      { key: 'nombres', label: 'Integrante', render: (r) => r.nombres ? `${r.nombres} ${r.apellidos}` : '— sin integrantes —' },
      { key: 'rolProyecto', label: 'Rol' }
    ]
  },
  {
    key: 'clientes-servicios-activos',
    titulo: '5. Clientes con servicios activos',
    columns: [
      { key: 'representante', label: 'Cliente' },
      { key: 'ruc', label: 'RUC' },
      { key: 'nombreServicio', label: 'Servicio' },
      { key: 'precio', label: 'Precio', render: (r) => `S/ ${Number(r.precio).toFixed(2)}` }
    ]
  },
  {
    key: 'cuotas-pendientes',
    titulo: '6. Estudiantes con cuotas pendientes o en mora',
    columns: [
      { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'nombreGrupo', label: 'Grupo' },
      { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
      { key: 'estadoPago', label: 'Estado', render: (r) => <span className={`pill ${r.estadoPago === 'EN_MORA' ? 'pill-red' : 'pill-yellow'}`}>{r.estadoPago}</span> }
    ]
  },
  {
    key: 'comunicaciones-abiertas',
    titulo: '7. Comunicaciones abiertas por usuario',
    columns: [
      { key: 'nombres', label: 'Usuario', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'comunicacionesAbiertas', label: 'Comunicaciones abiertas' }
    ]
  },
  {
    key: 'docentes-grupos',
    titulo: '8. Docentes activos y grupos a cargo',
    columns: [
      { key: 'nombres', label: 'Docente', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'nombreGrupo', label: 'Grupo' },
      { key: 'nombreCurso', label: 'Curso' },
      { key: 'estadoGrupo', label: 'Estado del grupo' }
    ]
  },
  {
    key: 'aptos-certificacion',
    titulo: '9. Estudiantes aptos para certificación',
    columns: [
      { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
      { key: 'dni', label: 'DNI' },
      { key: 'promedio', label: 'Promedio', render: (r) => Number(r.promedio).toFixed(2) }
    ]
  },
  {
    key: 'tiempo-atencion-tickets',
    titulo: '10. Tiempo promedio de atención de tickets Enterprise',
    columns: [
      { key: 'ticketsResueltos', label: 'Tickets resueltos' },
      { key: 'promedioHoras', label: 'Promedio de horas', render: (r) => r.promedioHoras != null ? Number(r.promedioHoras).toFixed(2) : '—' }
    ],
    esObjetoUnico: true
  }
];

export default function Reportes() {
  const [datos, setDatos] = useState({});
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState(REPORTES[0].key);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resultados = await Promise.all(
        REPORTES.map((r) => api.get(`/reportes/${r.key}`).then((res) => [r.key, res.data]).catch(() => [r.key, []]))
      );
      setDatos(Object.fromEntries(resultados));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1>Tablero de Reportes</h1>
      {loading && <p>Cargando reportes...</p>}

      {!loading && REPORTES.map((r) => {
        const data = datos[r.key];
        const rows = r.esObjetoUnico ? (data ? [data] : []) : (data || []);
        const isOpen = abierto === r.key;
        return (
          <div className="section" key={r.key}>
            <div className="toolbar" style={{ cursor: 'pointer', marginBottom: isOpen ? 12 : 0 }} onClick={() => setAbierto(isOpen ? null : r.key)}>
              <h2>{r.titulo}</h2>
              <span className="pill pill-blue">{rows.length} registro(s)</span>
            </div>
            {isOpen && <DataTable columns={r.columns} rows={rows} />}
          </div>
        );
      })}
    </div>
  );
}
