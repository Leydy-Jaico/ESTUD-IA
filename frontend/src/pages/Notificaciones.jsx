import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';

export default function Notificaciones() {
  const { usuario } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const soloPropias = usuario?.rol !== 'ADMINISTRADOR';

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/notificaciones', { params: soloPropias ? { idUsuario: usuario.idUsuario } : {} });
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const marcarLeida = async (id) => {
    await api.put(`/notificaciones/${id}/leer`);
    cargar();
  };

  return (
    <div>
      <h1>Notificaciones</h1>
      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idNotificacion', label: 'ID' },
            { key: 'titulo', label: 'Título' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.fecha).toLocaleString() },
            { key: 'estadoNotificacion', label: 'Estado', render: (r) => <span className={`pill ${r.estadoNotificacion === 'LEIDA' ? 'pill-gray' : 'pill-blue'}`}>{r.estadoNotificacion}</span> }
          ]}
          rows={items}
          actions={(row) => row.estadoNotificacion !== 'LEIDA' && (
            <button className="btn btn-secondary btn-sm" onClick={() => marcarLeida(row.idNotificacion)}><FiCheck /> Marcar leída</button>
          )}
        />
      )}
    </div>
  );
}
