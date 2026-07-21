import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['ACTIVO', 'PAUSADO', 'FINALIZADO'];

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [propuestas, setPropuestas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    const [s, p] = await Promise.all([api.get('/servicios'), api.get('/propuestas')]);
    setServicios(s.data);
    setPropuestas(p.data.filter((x) => x.estado === 'APROBADA'));
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (values) => {
    setError('');
    try {
      await api.post('/servicios', values);
      setModal(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el servicio.');
      throw err;
    }
  };

  const guardar = async (values) => {
    if (modal === 'crear') return crear(values);
    await api.put(`/servicios/${modal.idServicio}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    await api.delete(`/servicios/${id}`);
    cargar();
  };

  const camposCrear = [
    { name: 'idPropuesta', label: 'Propuesta aprobada', type: 'select', required: true, options: propuestas.map((p) => ({ value: p.idPropuesta, label: `#${p.idPropuesta} — ${p.representante} — S/ ${p.monto}` })) },
    { name: 'nombreServicio', label: 'Nombre del servicio', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'precio', label: 'Precio (S/)', type: 'number', required: true }
  ];
  const camposEditar = [
    { name: 'nombreServicio', label: 'Nombre del servicio', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'precio', label: 'Precio (S/)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS.map((e) => ({ value: e, label: e })) }
  ];

  return (
    <div>
      <div className="toolbar">
        <h1>Servicios</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo servicio</button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Los servicios solo pueden crearse a partir de una propuesta APROBADA (RF-05).</p>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idServicio', label: 'ID' },
            { key: 'nombreServicio', label: 'Servicio' },
            { key: 'representante', label: 'Cliente' },
            { key: 'precio', label: 'Precio', render: (r) => `S/ ${Number(r.precio).toFixed(2)}` },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={servicios}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idServicio)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo servicio' : 'Editar servicio'} onClose={() => setModal(null)}>
          {error && <div className="alert-error">{error}</div>}
          <EntityForm
            fields={modal === 'crear' ? camposCrear : camposEditar}
            initialValues={modal === 'crear' ? {} : modal}
            onSubmit={guardar}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
