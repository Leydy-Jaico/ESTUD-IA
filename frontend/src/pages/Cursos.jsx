import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const CAMPOS = [
  { name: 'nombreCurso', label: 'Nombre del curso', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
  { name: 'duracion', label: 'Duración (horas)', type: 'number' },
  { name: 'precio', label: 'Precio (S/)', type: 'number', required: true }
];

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [modal, setModal] = useState(null); // null | 'crear' | curso
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/cursos');
    setCursos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/cursos', values);
    else await api.put(`/cursos/${modal.idCurso}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este curso?')) return;
    await api.delete(`/cursos/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Cursos</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo curso</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idCurso', label: 'ID' },
            { key: 'nombreCurso', label: 'Nombre' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'duracion', label: 'Duración (h)' },
            { key: 'precio', label: 'Precio', render: (r) => `S/ ${Number(r.precio).toFixed(2)}` }
          ]}
          rows={cursos}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idCurso)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo curso' : 'Editar curso'} onClose={() => setModal(null)}>
          <EntityForm
            fields={CAMPOS}
            initialValues={modal === 'crear' ? {} : modal}
            onSubmit={guardar}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
