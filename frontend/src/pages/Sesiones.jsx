import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare, FiX, FiSave } from 'react-icons/fi';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const MODALIDADES = ['PRESENCIAL', 'VIRTUAL'];
const ESTADOS_SESION = ['PROGRAMADA', 'DICTADA', 'CANCELADA'];
const ESTADOS_ASISTENCIA = ['PRESENTE', 'TARDANZA', 'AUSENTE', 'JUSTIFICADO'];

export default function Sesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [modal, setModal] = useState(null);
  const [asistenciaSesion, setAsistenciaSesion] = useState(null);
  const [registros, setRegistros] = useState({});
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [s, g, m] = await Promise.all([
      api.get('/sesiones'),
      api.get('/grupos'),
      api.get('/matriculas')
    ]);
    setSesiones(s.data);
    setGrupos(g.data);
    setMatriculas(m.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const campos = [
    { name: 'idGrupo', label: 'Grupo', type: 'select', required: true, options: grupos.map((g) => ({ value: g.idGrupo, label: g.nombreGrupo })) },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'horaInicio', label: 'Hora inicio' },
    { name: 'horaFin', label: 'Hora fin' },
    { name: 'modalidad', label: 'Modalidad', type: 'select', required: true, options: MODALIDADES.map((m) => ({ value: m, label: m })) },
    { name: 'tema', label: 'Tema' },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_SESION.map((e) => ({ value: e, label: e })) }
  ];

  const guardar = async (values) => {
    if (modal === 'crear') await api.post('/sesiones', values);
    else await api.put(`/sesiones/${modal.idSesion}`, values);
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta sesión?')) return;
    await api.delete(`/sesiones/${id}`);
    cargar();
  };

  const abrirAsistencia = (sesion) => {
    setAsistenciaSesion(sesion);
    const estudiantesGrupo = matriculas.filter((m) => m.idGrupo === sesion.idGrupo && m.estadoMatricula === 'ACTIVA');
    const inicial = {};
    estudiantesGrupo.forEach((m) => { inicial[m.idEstudiante] = 'PRESENTE'; });
    setRegistros(inicial);
  };

  const guardarAsistencia = async () => {
    const payload = {
      fecha: asistenciaSesion.fecha,
      registros: Object.entries(registros).map(([idEstudiante, estadoAsistencia]) => ({
        idEstudiante: Number(idEstudiante),
        estadoAsistencia
      }))
    };
    await api.post(`/asistencias/sesion/${asistenciaSesion.idSesion}/masivo`, payload);
    setAsistenciaSesion(null);
    cargar();
  };

  const estudiantesDeSesion = asistenciaSesion
    ? matriculas.filter((m) => m.idGrupo === asistenciaSesion.idGrupo && m.estadoMatricula === 'ACTIVA')
    : [];

  return (
    <div>
      <div className="toolbar">
        <h1>Sesiones y Asistencia</h1>
        <button className="btn btn-primary" onClick={() => setModal('crear')}><FiPlus /> Nueva sesión</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable
          columns={[
            { key: 'idSesion', label: 'ID' },
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'fecha', label: 'Fecha', render: (r) => String(r.fecha).slice(0, 10) },
            { key: 'modalidad', label: 'Modalidad' },
            { key: 'tema', label: 'Tema' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={sesiones}
          actions={(row) => (
            <>
              <button className="btn btn-success btn-sm" onClick={() => abrirAsistencia(row)}><FiCheckSquare /> Asistencia</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(row)}><FiEdit2 /> Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(row.idSesion)}><FiTrash2 /> Eliminar</button>
            </>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nueva sesión' : 'Editar sesión'} onClose={() => setModal(null)}>
          <EntityForm fields={campos} initialValues={modal === 'crear' ? {} : modal} onSubmit={guardar} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {asistenciaSesion && (
        <Modal title={`Asistencia — ${asistenciaSesion.nombreGrupo} (${String(asistenciaSesion.fecha).slice(0, 10)})`} onClose={() => setAsistenciaSesion(null)}>
          {estudiantesDeSesion.length === 0 && <p>No hay estudiantes matriculados activos en este grupo.</p>}
          {estudiantesDeSesion.map((m) => (
            <div className="form-field" key={m.idEstudiante}>
              <label>{m.nombres} {m.apellidos}</label>
              <select
                value={registros[m.idEstudiante] || 'PRESENTE'}
                onChange={(e) => setRegistros((r) => ({ ...r, [m.idEstudiante]: e.target.value }))}
              >
                {ESTADOS_ASISTENCIA.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          ))}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setAsistenciaSesion(null)}><FiX /> Cancelar</button>
            <button className="btn btn-primary" onClick={guardarAsistencia} disabled={estudiantesDeSesion.length === 0}>
              <FiSave /> Guardar asistencia
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
