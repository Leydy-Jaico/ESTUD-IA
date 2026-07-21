import { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const TIPOS = ['CONSULTA', 'ALERTA', 'TICKET_SOPORTE', 'SEGUIMIENTO'];
const ESTADOS = ['ABIERTO', 'ASIGNADO', 'RESUELTO', 'CERRADO'];

function pillEstado(estado) {
  const map = { ABIERTO: 'pill-yellow', ASIGNADO: 'pill-blue', RESUELTO: 'pill-green', CERRADO: 'pill-gray' };
  return <span className={`pill ${map[estado] || 'pill-gray'}`}>{estado}</span>;
}

export default function Comunicaciones() {
  const [items, setItems] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(null);
  const [editEstado, setEditEstado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [c, u, cl] = await Promise.all([
      api.get('/comunicaciones', { params: filtroTipo ? { tipoComunicacion: filtroTipo } : {} }),
      api.get('/usuarios'),
      api.get('/clientes')
    ]);
    setItems(c.data);
    setUsuarios(u.data);
    setClientes(cl.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtroTipo]);

  const crear = async (values) => {
    await api.post('/comunicaciones', {
      ...values,
      idUsuario: values.idUsuario ? Number(values.idUsuario) : null,
      idCliente: values.idCliente ? Number(values.idCliente) : null
    });
    setModal(null);
    cargar();
  };

  const guardarEstado = async (values) => {
    await api.put(`/comunicaciones/${editEstado.idComunicacion}/estado`, values);
    setEditEstado(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await api.delete(`/comunicaciones/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Comunicaciones y Tickets de Soporte</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo registro</button>
      </div>

      <div className="filters">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idComunicacion', label: 'ID' },
            { key: 'tipoComunicacion', label: 'Tipo' },
            { key: 'asunto', label: 'Asunto' },
            { key: 'usuarioNombres', label: 'Usuario/Cliente', render: (r) => r.usuarioNombres ? `${r.usuarioNombres} ${r.usuarioApellidos}` : (r.representante || '—') },
            { key: 'canal', label: 'Canal' },
            { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.fecha).toLocaleString() },
            { key: 'estado', label: 'Estado', render: (r) => pillEstado(r.estado) },
            { key: 'tiempoAtencionHoras', label: 'Tiempo atención (h)', render: (r) => r.tiempoAtencionHoras != null ? Number(r.tiempoAtencionHoras).toFixed(2) : '—' }
          ]}
          rows={items}
          actions={(row) => (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditEstado(row)}><FiRefreshCw /> Cambiar estado</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idComunicacion)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title="Nuevo registro" onClose={() => setModal(null)}>
          <EntityForm
            fields={[
              { name: 'tipoComunicacion', label: 'Tipo', type: 'select', required: true, options: TIPOS.map((t) => ({ value: t, label: t })) },
              { name: 'idUsuario', label: 'Usuario (opcional)', type: 'select', options: usuarios.map((u) => ({ value: u.idUsuario, label: `${u.nombres} ${u.apellidos}` })) },
              { name: 'idCliente', label: 'Cliente (opcional, para tickets Enterprise)', type: 'select', options: clientes.map((c) => ({ value: c.idCliente, label: `${c.representante} (${c.ruc})` })) },
              { name: 'asunto', label: 'Asunto' },
              { name: 'detalle', label: 'Detalle', type: 'textarea' },
              { name: 'canal', label: 'Canal (WhatsApp, Correo, etc.)' }
            ]}
            initialValues={{}}
            onSubmit={crear}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {editEstado && (
        <Modal title="Actualizar estado" onClose={() => setEditEstado(null)}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Al marcar RESUELTO o CERRADO se calcula el tiempo de atención (RF-10).</p>
          <EntityForm
            fields={[{ name: 'estado', label: 'Estado', type: 'select', required: true, options: ESTADOS.map((e) => ({ value: e, label: e })) }]}
            initialValues={{ estado: editEstado.estado }}
            onSubmit={guardarEstado}
            onCancel={() => setEditEstado(null)}
          />
        </Modal>
      )}
    </div>
  );
}
