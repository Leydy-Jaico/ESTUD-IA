import { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';

function Kpi({ valor, etiqueta }) {
  return (
    <div className="placeholder" style={{ padding: 14, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{valor}</div>
      <div className="label">{etiqueta}</div>
    </div>
  );
}

function KpiRow({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${children.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function InicioEstudiante({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.promedio ?? '—'} etiqueta="Promedio" />
        <Kpi valor={`${data.porcentajeAsistencia}%`} etiqueta="Asistencia" />
        <Kpi valor={data.estadoAcademico} etiqueta="Estado académico" />
      </KpiRow>
      <div className="section">
        <h2>Próxima sesión</h2>
        {data.proximaSesion
          ? <p>{String(data.proximaSesion.fecha).slice(0, 10)} — {data.proximaSesion.nombreGrupo}</p>
          : <p>No tienes sesiones programadas.</p>}
      </div>
      <div className="section">
        <h2>Tareas pendientes ({data.tareasPendientes.length})</h2>
        <DataTable
          columns={[
            { key: 'titulo', label: 'Tarea' },
            { key: 'tipo', label: 'Estado', render: (r) => r.tipo === 'POR_CALIFICAR' ? 'Entregada, por calificar' : 'Por entregar' }
          ]}
          rows={data.tareasPendientes}
        />
      </div>
      <div className="section">
        <h2>Cuotas ({data.cuotasPendientes} pendiente{data.cuotasPendientes === 1 ? '' : 's'})</h2>
        <DataTable
          columns={[
            { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
            { key: 'estadoPago', label: 'Estado' }
          ]}
          rows={data.pagos}
        />
      </div>
    </div>
  );
}

function InicioDocente({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.grupos.length} etiqueta="Grupos a cargo" />
        <Kpi valor={data.entregasPendientes.length} etiqueta="Entregas por calificar" />
        <Kpi valor={`${data.porcentajeAsistenciaPromedio}%`} etiqueta="Asistencia promedio" />
      </KpiRow>
      <div className="section">
        <h2>Grupos a cargo</h2>
        <DataTable
          columns={[
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'nombreCurso', label: 'Curso' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.grupos}
        />
      </div>
      <div className="section">
        <h2>Próximas sesiones</h2>
        <DataTable
          columns={[
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'fecha', label: 'Fecha', render: (r) => String(r.fecha).slice(0, 10) }
          ]}
          rows={data.proximasSesiones}
        />
      </div>
      <div className="section">
        <h2>Entregas pendientes de calificar</h2>
        <DataTable
          columns={[
            { key: 'titulo', label: 'Tarea' },
            { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.entregasPendientes}
        />
      </div>
    </div>
  );
}

function InicioDesarrollador({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.proyectos.length} etiqueta="Proyectos asignados" />
        <Kpi valor={data.proyectosEnDesarrollo} etiqueta="En desarrollo" />
      </KpiRow>
      <div className="section">
        <h2>Mis proyectos</h2>
        <DataTable
          columns={[
            { key: 'nombreProyecto', label: 'Proyecto' },
            { key: 'estado', label: 'Estado' },
            { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) },
            { key: 'rolProyecto', label: 'Mi rol' }
          ]}
          rows={data.proyectos}
        />
      </div>
      <div className="section">
        <h2>Seguimiento</h2>
        <DataTable
          columns={[
            { key: 'asunto', label: 'Asunto' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.comunicacionesSeguimiento}
        />
      </div>
    </div>
  );
}

function InicioAdministrador({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.estudiantesActivos} etiqueta="Estudiantes activos" />
        <Kpi valor={`S/ ${Number(data.ingresosMes).toFixed(2)}`} etiqueta="Ingresos del mes" />
        <Kpi valor={data.matriculasActivas} etiqueta="Matrículas activas" />
        <Kpi valor={data.serviciosActivos} etiqueta="Servicios Enterprise activos" />
      </KpiRow>
      <div className="section">
        <h2>Proyectos Labs en desarrollo</h2>
        <DataTable
          columns={[
            { key: 'nombreProyecto', label: 'Proyecto' },
            { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) }
          ]}
          rows={data.proyectosEnDesarrollo}
        />
      </div>
      <div className="section">
        <p><span className="pill pill-blue">{data.comunicacionesAbiertas} comunicaciones abiertas o asignadas</span></p>
      </div>
    </div>
  );
}

const ENDPOINT_POR_ROL = {
  ESTUDIANTE: '/dashboard/estudiante',
  DOCENTE: '/dashboard/docente',
  DESARROLLADOR: '/dashboard/desarrollador',
  ADMINISTRADOR: '/dashboard/administrador'
};

const VISTA_POR_ROL = {
  ESTUDIANTE: InicioEstudiante,
  DOCENTE: InicioDocente,
  DESARROLLADOR: InicioDesarrollador,
  ADMINISTRADOR: InicioAdministrador
};

export default function Inicio() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = ENDPOINT_POR_ROL[usuario?.rol];
    if (!endpoint) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await api.get(endpoint);
      setData(data);
      setLoading(false);
    })();
  }, [usuario?.rol]);

  if (loading) return <p>Cargando...</p>;

  const Vista = VISTA_POR_ROL[usuario?.rol];
  if (!Vista || !data) return <p>No hay un inicio configurado para tu rol.</p>;

  return (
    <div>
      <h1>Hola, {usuario.nombres}</h1>
      <Vista data={data} />
    </div>
  );
}
