import { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['ACTIVA', 'RETIRADA', 'FINALIZADA'];

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [modal, setModal] = useState(null);
  const [editEstado, setEditEstado] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [m, e, g] = await Promise.all([
      api.get('/matriculas'),
      api.get('/usuarios', { params: { rol: 'ESTUDIANTE' } }),
      api.get('/grupos')
    ]);
    setMatriculas(m.data);
    setEstudiantes(e.data);
    setGrupos(g.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (values) => {
    await api.post('/matriculas', values);
    setModal(null);
    cargar();
  };

  const actualizarEstado = async (values) => {
    await api.put(`/matriculas/${editEstado.idMatricula}`, values);
    setEditEstado(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta matrícula?')) return;
    await api.delete(`/matriculas/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Matrículas</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nueva matrícula</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idMatricula', label: 'ID' },
            { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'fechaMatricula', label: 'Fecha', render: (r) => String(r.fechaMatricula).slice(0, 10) },
            { key: 'estadoMatricula', label: 'Estado' },
            { key: 'observaciones', label: 'Observaciones' }
          ]}
          rows={matriculas}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditEstado(row)}><FiRefreshCw /> Cambiar estado</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idMatricula)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title="Nueva matrícula" onClose={() => setModal(null)}>
          <EntityForm
            fields={[
              { name: 'idEstudiante', label: 'Estudiante', type: 'select', required: true, options: estudiantes.map((e) => ({ value: e.idUsuario, label: `${e.nombres} ${e.apellidos}` })) },
              { name: 'idGrupo', label: 'Grupo', type: 'select', required: true, options: grupos.map((g) => ({ value: g.idGrupo, label: g.nombreGrupo })) },
              { name: 'observaciones', label: 'Observaciones (ej. pago en cuotas)', type: 'textarea' }
            ]}
            initialValues={{}}
            onSubmit={crear}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {editEstado && (
        <Modal title="Actualizar estado de matrícula" onClose={() => setEditEstado(null)}>
          <EntityForm
            fields={[
              { name: 'estadoMatricula', label: 'Estado', type: 'select', required: true, options: ESTADOS.map((e) => ({ value: e, label: e })) },
              { name: 'observaciones', label: 'Observaciones', type: 'textarea' }
            ]}
            initialValues={editEstado}
            onSubmit={actualizarEstado}
            onCancel={() => setEditEstado(null)}
          />
        </Modal>
      )}
    </div>
  );
}
