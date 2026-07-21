import { useEffect, useState } from 'react';
import { FiPlus, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const MEDIOS = ['YAPE', 'TRANSFERENCIA', 'EFECTIVO', 'PLIN'];

function pillEstado(estado) {
  const map = { PAGADO: 'pill-green', PENDIENTE: 'pill-yellow', EN_MORA: 'pill-red' };
  return <span className={`pill ${map[estado] || 'pill-gray'}`}>{estado}</span>;
}

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    setLoading(true);
    const [p, m] = await Promise.all([api.get('/pagos'), api.get('/matriculas')]);
    setPagos(p.data);
    setMatriculas(m.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (values) => {
    const matricula = matriculas.find((m) => m.idMatricula === Number(values.idMatricula));
    await api.post('/pagos', {
      idUsuario: matricula.idEstudiante,
      idMatricula: Number(values.idMatricula),
      monto: values.monto,
      medioPago: values.medioPago,
      comprobante: values.comprobante
    });
    setModal(null);
    cargar();
  };

  const verificar = async (id) => {
    setMensaje('');
    try {
      await api.put(`/pagos/${id}/verificar`);
      setMensaje('Pago verificado correctamente.');
    } catch (err) {
      setMensaje(err.response?.data?.error || 'No se pudo verificar el pago.');
    }
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este pago?')) return;
    await api.delete(`/pagos/${id}`);
    cargar();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Pagos (cuotas)</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Registrar pago</button>
      </div>

      {mensaje && <div className="alert-success">{mensaje}</div>}

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idPago', label: 'ID' },
            { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
            { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
            { key: 'medioPago', label: 'Medio' },
            { key: 'comprobante', label: 'Comprobante' },
            { key: 'fechaPago', label: 'Fecha de pago', render: (r) => new Date(r.fechaPago).toLocaleString() },
            { key: 'estadoPago', label: 'Estado', render: (r) => pillEstado(r.estadoPago) }
          ]}
          rows={pagos}
          actions={(row) => (
            <>
              {row.estadoPago !== 'PAGADO' && (
                <button className="btn btn-success btn-sm" onClick={() => verificar(row.idPago)}><FiCheckCircle /> Verificar</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idPago)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(null)}>
          <EntityForm
            fields={[
              { name: 'idMatricula', label: 'Matrícula', type: 'select', required: true, options: matriculas.map((m) => ({ value: m.idMatricula, label: `#${m.idMatricula} — ${m.nombres} ${m.apellidos} (${m.nombreGrupo})` })) },
              { name: 'monto', label: 'Monto (S/)', type: 'number', required: true },
              { name: 'medioPago', label: 'Medio de pago', type: 'select', required: true, options: MEDIOS.map((m) => ({ value: m, label: m })) },
              { name: 'comprobante', label: 'Comprobante (nombre de archivo)' }
            ]}
            initialValues={{}}
            onSubmit={crear}
            onCancel={() => setModal(null)}
            submitLabel="Registrar pago"
          />
        </Modal>
      )}
    </div>
  );
}
