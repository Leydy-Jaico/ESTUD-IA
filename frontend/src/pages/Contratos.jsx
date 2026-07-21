import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['VIGENTE', 'CERRADO'];

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [c, s] = await Promise.all([api.get('/contratos'), api.get('/servicios')]);
    setContratos(c.data);
    setServicios(s.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/contratos', values);
    else await api.put(`/contratos/${modal.idContrato}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este contrato?')) return;
    await api.delete(`/contratos/${id}`);
    cargar();
  };

  const camposCrear = [
    { name: 'idServicio', label: 'Servicio', type: 'select', required: true, options: servicios.map((s) => ({ value: s.idServicio, label: `${s.nombreServicio} — ${s.representante}` })) },
    { name: 'monto', label: 'Monto (S/)', type: 'number', required: true },
    { name: 'fechaFin', label: 'Fecha de fin', type: 'date' },
    { name: 'archivoContrato', label: 'Archivo del contrato (nombre)' }
  ];
  const camposEditar = [
    { name: 'monto', label: 'Monto (S/)', type: 'number', required: true },
    { name: 'fechaFin', label: 'Fecha de fin', type: 'date' },
    { name: 'estadoContratado', label: 'Estado', type: 'select', options: ESTADOS.map((e) => ({ value: e, label: e })) },
    { name: 'archivoContrato', label: 'Archivo del contrato (nombre)' }
  ];

  return (
    <div>
      <div className="toolbar">
        <h1>Contratos</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo contrato</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idContrato', label: 'ID' },
            { key: 'nombreServicio', label: 'Servicio' },
            { key: 'representante', label: 'Cliente' },
            { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
            { key: 'fechaFin', label: 'Fin', render: (r) => r.fechaFin ? String(r.fechaFin).slice(0, 10) : '—' },
            { key: 'estadoContratado', label: 'Estado' }
          ]}
          rows={contratos}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idContrato)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo contrato' : 'Editar contrato'} onClose={() => setModal(null)}>
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
