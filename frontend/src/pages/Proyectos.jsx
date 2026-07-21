import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiUserMinus } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ESTADOS = ['DISENO', 'DESARROLLO', 'PRUEBAS', 'FINALIZADO'];

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [integrantes, setIntegrantes] = useState([]);
  const [nuevoIntegrante, setNuevoIntegrante] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [p, u] = await Promise.all([api.get('/proyectos'), api.get('/usuarios')]);
    setProyectos(p.data);
    setUsuarios(u.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const campos = [
    { name: 'nombreProyecto', label: 'Nombre del proyecto', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    { name: 'tipoSolucion', label: 'Tipo de solución' },
    { name: 'fechaInicio', label: 'Fecha de inicio', type: 'date', required: true },
    { name: 'fechaLimite', label: 'Fecha límite', type: 'date', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS.map((e) => ({ value: e, label: e })) },
    { name: 'repositorio', label: 'Repositorio (URL)' }
  ];

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/proyectos', values);
    else await api.put(`/proyectos/${modal.idProyecto}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await api.delete(`/proyectos/${id}`);
    cargar();
  };

  const verEquipo = async (proyecto) => {
    setEquipo(proyecto);
    const { data } = await api.get(`/proyectos/${proyecto.idProyecto}`);
    setIntegrantes(data.integrantes);
  };

  const agregarIntegrante = async (values) => {
    await api.post('/integrantes', { idUsuario: Number(values.idUsuario), idProyecto: equipo.idProyecto, rolProyecto: values.rolProyecto });
    setNuevoIntegrante(false);
    verEquipo(equipo);
  };

  const quitarIntegrante = async (idIntegrante) => {
    if (!confirm('¿Quitar a este integrante del proyecto?')) return;
    await api.delete(`/integrantes/${idIntegrante}`);
    verEquipo(equipo);
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Proyectos Labs</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nuevo proyecto</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idProyecto', label: 'ID' },
            { key: 'nombreProyecto', label: 'Proyecto' },
            { key: 'tipoSolucion', label: 'Tipo' },
            { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={proyectos}
          actions={(row) => (
            <>
              <button className="btn btn-success btn-sm" onClick={() => verEquipo(row)}><FiUsers /> Equipo</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idProyecto)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo proyecto' : 'Editar proyecto'} onClose={() => setModal(null)}>
          <EntityForm fields={campos} initialValues={modal === 'crear' ? {} : modal} onSubmit={guardar} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {equipo && (
        <Modal title={`Equipo — ${equipo.nombreProyecto}`} onClose={() => setEquipo(null)}>
          <button className="btn btn-primary btn-sm" style={{ marginBottom: 12 }} onClick={() => setNuevoIntegrante(true)}><FiPlus /> Agregar integrante</button>
          <DataTable
            columns={[
              { key: 'nombres', label: 'Integrante', render: (r) => `${r.nombres} ${r.apellidos}` },
              { key: 'rolProyecto', label: 'Rol' },
              { key: 'fechaAsignacion', label: 'Desde', render: (r) => String(r.fechaAsignacion).slice(0, 10) }
            ]}
            rows={integrantes}
            actions={(row) => <button className="btn btn-danger btn-sm" onClick={() => quitarIntegrante(row.idIntegrante)}><FiUserMinus /> Quitar</button>}
          />

          {nuevoIntegrante && (
            <div style={{ marginTop: 16 }}>
              <EntityForm
                fields={[
                  { name: 'idUsuario', label: 'Usuario', type: 'select', required: true, options: usuarios.map((u) => ({ value: u.idUsuario, label: `${u.nombres} ${u.apellidos} (${u.rol})` })) },
                  { name: 'rolProyecto', label: 'Rol en el proyecto' }
                ]}
                initialValues={{}}
                onSubmit={agregarIntegrante}
                onCancel={() => setNuevoIntegrante(false)}
                submitLabel="Agregar"
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
