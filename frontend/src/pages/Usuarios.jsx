import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const ROLES = ['ADMINISTRADOR', 'ESTUDIANTE', 'DOCENTE', 'DESARROLLADOR'];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rolNuevo, setRolNuevo] = useState('DOCENTE');
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/usuarios', { params: filtroRol ? { rol: filtroRol } : {} });
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtroRol]);

  const crear = async (values) => {
    const body = {
      nombres: values.nombres,
      apellidos: values.apellidos,
      correo: values.correo,
      contrasena: values.contrasena,
      telefono: values.telefono,
      rol: rolNuevo
    };
    if (rolNuevo === 'ADMINISTRADOR') {
      body.cargo = values.cargo;
      body.permisos = values.permisos;
    }
    if (rolNuevo === 'ESTUDIANTE') {
      body.dni = values.dni;
      body.apoderado = {
        nombre: values.apNombre,
        apellidos: values.apApellidos,
        parentesco: values.apParentesco,
        direccion: values.apDireccion,
        celular: values.apCelular
      };
    }
    await api.post('/usuarios', body);
    setModalOpen(false);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    await api.delete(`/usuarios/${id}`);
    cargar();
  };

  const camposBase = [
    { name: 'nombres', label: 'Nombres', required: true },
    { name: 'apellidos', label: 'Apellidos', required: true },
    { name: 'correo', label: 'Correo', type: 'email', required: true },
    { name: 'contrasena', label: 'Contraseña', type: 'password', required: true },
    { name: 'telefono', label: 'Teléfono' }
  ];
  const camposAdmin = [{ name: 'cargo', label: 'Cargo' }, { name: 'permisos', label: 'Permisos' }];
  const camposEstudiante = [
    { name: 'dni', label: 'DNI', required: true },
    { name: 'apNombre', label: 'Apoderado: nombre', required: true },
    { name: 'apApellidos', label: 'Apoderado: apellidos', required: true },
    { name: 'apParentesco', label: 'Apoderado: parentesco' },
    { name: 'apDireccion', label: 'Apoderado: dirección' },
    { name: 'apCelular', label: 'Apoderado: celular', required: true }
  ];

  const campos = [
    ...camposBase,
    ...(rolNuevo === 'ADMINISTRADOR' ? camposAdmin : []),
    ...(rolNuevo === 'ESTUDIANTE' ? camposEstudiante : [])
  ];

  return (
    <div>
      <div className="toolbar">
        <h1>Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><FiPlus /> Nuevo usuario</button>
      </div>

      <div className="filters">
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idUsuario', label: 'ID' },
            { key: 'nombres', label: 'Nombres' },
            { key: 'apellidos', label: 'Apellidos' },
            { key: 'correo', label: 'Correo' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'rol', label: 'Rol' }
          ]}
          rows={usuarios}
          actions={(row) => (
            <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idUsuario)}><FiTrash2 /> Eliminar</button>
          )}
        />
      )}

      {modalOpen && (
        <Modal title="Nuevo usuario" onClose={() => setModalOpen(false)}>
          <div className="form-field">
            <label>Rol</label>
            <select value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <EntityForm
            fields={campos}
            initialValues={{}}
            onSubmit={crear}
            onCancel={() => setModalOpen(false)}
            submitLabel="Crear usuario"
          />
        </Modal>
      )}
    </div>
  );
}
