import { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

function pillEstado(estado) {
  const map = { APROBADA: 'pill-green', RECHAZADA: 'pill-red', PENDIENTE: 'pill-yellow' };
  return <span className={`pill ${map[estado] || 'pill-gray'}`}>{estado}</span>;
}

export default function Propuestas() {
  const [propuestas, setPropuestas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(null);
  const [editEstado, setEditEstado] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([api.get('/propuestas'), api.get('/clientes')]);
    setPropuestas(p.data);
    setClientes(c.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (values) => {
    await api.post('/propuestas', values);
    setModal(null);
    cargar();
  };

  const guardarEstado = async (values) => {
    await api.put(`/propuestas/${editEstado.idPropuesta}/estado`, values);
    setEditEstado(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta propuesta?')) return;
    await api.delete(`/propuestas/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Propuestas</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nueva propuesta</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idPropuesta', label: 'ID' },
            { key: 'representante', label: 'Cliente', render: (r) => `${r.representante} (${r.ruc})` },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
            { key: 'fechaEmision', label: 'Emisión', render: (r) => String(r.fechaEmision).slice(0, 10) },
            { key: 'estado', label: 'Estado', render: (r) => pillEstado(r.estado) }
          ]}
          rows={propuestas}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditEstado(row)}><FiRefreshCw /> Cambiar estado</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idPropuesta)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title="Nueva propuesta" onClose={() => setModal(null)}>
          <EntityForm
            fields={[
              { name: 'idCliente', label: 'Cliente', type: 'select', required: true, options: clientes.map((c) => ({ value: c.idCliente, label: `${c.representante} (${c.ruc})` })) },
              { name: 'descripcion', label: 'Descripción', type: 'textarea' },
              { name: 'monto', label: 'Monto (S/)', type: 'number', required: true },
              { name: 'fechaEmision', label: 'Fecha de emisión', type: 'date', required: true }
            ]}
            initialValues={{}}
            onSubmit={crear}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {editEstado && (
        <Modal title="Actualizar estado de la propuesta" onClose={() => setEditEstado(null)}>
          <EntityForm
            fields={[
              { name: 'estado', label: 'Estado', type: 'select', required: true, options: ESTADOS.map((e) => ({ value: e, label: e })) },
              { name: 'fechaRespuesta', label: 'Fecha de respuesta', type: 'date' }
            ]}
            initialValues={editEstado}
            onSubmit={guardarEstado}
            onCancel={() => setEditEstado(null)}
          />
        </Modal>
      )}
    </div>
  );
}
