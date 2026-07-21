import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckCircle } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS_TAREA = ['ABIERTA', 'CERRADA'];

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modal, setModal] = useState(null);
  const [entregasTarea, setEntregasTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [calificarEntrega, setCalificarEntrega] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [t, c] = await Promise.all([api.get('/tareas'), api.get('/cursos')]);
    setTareas(t.data);
    setCursos(c.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const campos = [
    { name: 'idCurso', label: 'Curso', type: 'select', required: true, options: cursos.map((c) => ({ value: c.idCurso, label: c.nombreCurso })) },
    { name: 'titulo', label: 'Título', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'fechaPublicacion', label: 'Fecha de publicación', type: 'date', required: true },
    { name: 'fechaEntrega', label: 'Fecha límite de entrega', type: 'date', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_TAREA.map((e) => ({ value: e, label: e })) }
  ];

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/tareas', values);
    else await api.put(`/tareas/${modal.idTarea}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await api.delete(`/tareas/${id}`);
    cargar();
  };

  const verEntregas = async (tarea) => {
    setEntregasTarea(tarea);
    const { data } = await api.get('/entregas', { params: { idTarea: tarea.idTarea } });
    setEntregas(data);
  };

  const guardarCalificacion = async (values) => {
    await api.put(`/entregas/${calificarEntrega.idEntrega}/calificar`, values);
    setCalificarEntrega(null);
    verEntregas(entregasTarea);
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Tareas y Entregas</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nueva tarea</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idTarea', label: 'ID' },
            { key: 'nombreCurso', label: 'Curso' },
            { key: 'titulo', label: 'Título' },
            { key: 'fechaEntrega', label: 'Entrega límite', render: (r) => String(r.fechaEntrega).slice(0, 10) },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={tareas}
          actions={(row) => (
            <>
              <button className="btn btn-success btn-sm" onClick={() => verEntregas(row)}><FiEye /> Ver entregas</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idTarea)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nueva tarea' : 'Editar tarea'} onClose={() => setModal(null)}>
          <EntityForm fields={campos} initialValues={modal === 'crear' ? {} : modal} onSubmit={guardar} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {entregasTarea && (
        <Modal title={`Entregas — ${entregasTarea.titulo}`} onClose={() => setEntregasTarea(null)}>
          <DataTable
            columns={[
              { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
              { key: 'fechaEntrega', label: 'Entregado', render: (r) => new Date(r.fechaEntrega).toLocaleString() },
              { key: 'estado', label: 'Estado' },
              { key: 'calificacion', label: 'Nota', render: (r) => r.calificacion ?? '—' }
            ]}
            rows={entregas}
            actions={(row) => (
              <button className="btn btn-primary btn-sm" onClick={() => setCalificarEntrega(row)}><FiCheckCircle /> Calificar</button>
            )}
          />
        </Modal>
      )}

      {calificarEntrega && (
        <Modal title={`Calificar entrega de ${calificarEntrega.nombres} ${calificarEntrega.apellidos}`} onClose={() => setCalificarEntrega(null)}>
          <EntityForm
            fields={[
              { name: 'calificacion', label: 'Calificación (0-20)', type: 'number', required: true },
              { name: 'observacion', label: 'Observación', type: 'textarea' }
            ]}
            initialValues={{ calificacion: calificarEntrega.calificacion || '' }}
            onSubmit={guardarCalificacion}
            onCancel={() => setCalificarEntrega(null)}
            submitLabel="Calificar"
          />
        </Modal>
      )}
    </div>
  );
}
