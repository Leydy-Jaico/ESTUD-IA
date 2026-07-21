import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO'];

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [modal, setModal] = useState(null);
  const [asignar, setAsignar] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [g, c, d] = await Promise.all([
      api.get('/grupos'),
      api.get('/cursos'),
      api.get('/usuarios', { params: { rol: 'DOCENTE' } })
    ]);
    setGrupos(g.data);
    setCursos(c.data);
    setDocentes(d.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const campos = [
    { name: 'idCurso', label: 'Curso', type: 'select', required: true, options: cursos.map((c) => ({ value: c.idCurso, label: c.nombreCurso })) },
    { name: 'idDocente', label: 'Docente', type: 'select', options: docentes.map((d) => ({ value: d.idUsuario, label: `${d.nombres} ${d.apellidos}` })) },
    { name: 'nombreGrupo', label: 'Nombre del grupo', required: true },
    { name: 'fechaInicio', label: 'Fecha de inicio', type: 'date', required: true },
    { name: 'fechaFin', label: 'Fecha de fin', type: 'date' },
    { name: 'horario', label: 'Horario' },
    { name: 'cupos', label: 'Cupos', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS.map((e) => ({ value: e, label: e })) }
  ];

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/grupos', values);
    else await api.put(`/grupos/${modal.idGrupo}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    await api.delete(`/grupos/${id}`);
    cargar();
  };

  const guardarAsignacion = async (values) => {
    await api.put(`/grupos/${asignar.idGrupo}/asignar-docente`, { idDocente: Number(values.idDocente) });
    setAsignar(null);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Grupos</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo grupo</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idGrupo', label: 'ID' },
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'nombreCurso', label: 'Curso' },
            { key: 'docenteNombres', label: 'Docente', render: (r) => r.docenteNombres ? `${r.docenteNombres} ${r.docenteApellidos}` : '— sin asignar —' },
            { key: 'fechaInicio', label: 'Inicio', render: (r) => String(r.fechaInicio).slice(0, 10) },
            { key: 'cupos', label: 'Cupos' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={grupos}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-success btn-sm" onClick={() => setAsignar(row)}><FiUserCheck /> Asignar docente</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idGrupo)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo grupo' : 'Editar grupo'} onClose={() => setModal(null)}>
          <EntityForm
            fields={campos}
            initialValues={modal === 'crear' ? {} : modal}
            onSubmit={guardar}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {asignar && (
        <Modal title={`Asignar docente al grupo "${asignar.nombreGrupo}"`} onClose={() => setAsignar(null)}>
          <p>Se enviará una notificación automática al docente asignado (RF-08).</p>
          <EntityForm
            fields={[{ name: 'idDocente', label: 'Docente', type: 'select', required: true, options: docentes.map((d) => ({ value: d.idUsuario, label: `${d.nombres} ${d.apellidos}` })) }]}
            initialValues={{ idDocente: asignar.idDocente || '' }}
            onSubmit={guardarAsignacion}
            onCancel={() => setAsignar(null)}
            submitLabel="Asignar y notificar"
          />
        </Modal>
      )}
    </div>
  );
}
