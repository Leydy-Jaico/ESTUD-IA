import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['ACTIVO', 'INACTIVO'];

const CAMPOS = [
  { name: 'ruc', label: 'RUC', required: true },
  { name: 'representante', label: 'Representante' },
  { name: 'correo', label: 'Correo', type: 'email' },
  { name: 'direccion', label: 'Dirección' },
  { name: 'telefono', label: 'Teléfono' },
  { name: 'estadoCliente', label: 'Estado', type: 'select', options: ESTADOS.map((e) => ({ value: e, label: e })) }
];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/clientes');
    setClientes(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/clientes', values);
    else await api.put(`/clientes/${modal.idCliente}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Clientes (Enterprise)</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo cliente</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idCliente', label: 'ID' },
            { key: 'ruc', label: 'RUC' },
            { key: 'representante', label: 'Representante' },
            { key: 'correo', label: 'Correo' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'estadoCliente', label: 'Estado' }
          ]}
          rows={clientes}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idCliente)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo cliente' : 'Editar cliente'} onClose={() => setModal(null)}>
          <EntityForm fields={CAMPOS} initialValues={modal === 'crear' ? {} : modal} onSubmit={guardar} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
