import { useEffect, useState } from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';

export default function MensajesContacto() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/mensajes-contacto');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const atender = async (id) => {
    await api.put(`/mensajes-contacto/${id}/atender`);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await api.delete(`/mensajes-contacto/${id}`);
    cargar();
  };

  return (
    <div>
      <h1>Mensajes de contacto</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Mensajes recibidos desde el formulario público del sitio web.</p>
      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idMensaje', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'correo', label: 'Correo' },
            { key: 'mensaje', label: 'Mensaje' },
            { key: 'fechaEnvio', label: 'Fecha', render: (r) => new Date(r.fechaEnvio).toLocaleString() },
            { key: 'estadoMensaje', label: 'Estado', render: (r) => <span className={`pill ${r.estadoMensaje === 'ATENDIDO' ? 'pill-green' : 'pill-yellow'}`}>{r.estadoMensaje}</span> }
          ]}
          rows={items}
          actions={(row) => (
            <>
              {row.estadoMensaje !== 'ATENDIDO' && (
                <button className="btn btn-success btn-sm" onClick={() => atender(row.idMensaje)}><FiCheck /> Marcar atendido</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idMensaje)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}
    </div>
  );
}
