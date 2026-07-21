import { useEffect, useState } from 'react';
import { FiAward, FiCheckCircle } from 'react-icons/fi';
import api from '../api/client';

function pillEstado(estado) {
  const map = { APROBADO: 'pill-green', REPROBADO: 'pill-red', PENDIENTE: 'pill-yellow' };
  return <span className={`pill ${map[estado] || 'pill-gray'}`}>{estado}</span>;
}

export default function Certificados() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [idEstudiante, setIdEstudiante] = useState('');
  const [estado, setEstado] = useState(null);
  const [certificado, setCertificado] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/usuarios', { params: { rol: 'ESTUDIANTE' } }).then(({ data }) => setEstudiantes(data));
  }, []);

  const consultar = async (id) => {
    setError('');
    setCertificado(null);
    setEstado(null);
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/academico/${id}/estado`);
      setEstado(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo consultar el estado académico.');
    } finally {
      setLoading(false);
    }
  };

  const emitirCertificado = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get(`/academico/${idEstudiante}/certificado`);
      setCertificado(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo emitir el certificado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Estado académico y Certificado digital</h1>

      <div className="card" style={{ maxWidth: 480, marginBottom: 24 }}>
        <div className="form-field">
          <label>Estudiante</label>
          <select
            value={idEstudiante}
            onChange={(e) => { setIdEstudiante(e.target.value); consultar(e.target.value); }}
          >
            <option value="">-- Seleccione --</option>
            {estudiantes.map((e) => (
              <option key={e.idUsuario} value={e.idUsuario}>{e.nombres} {e.apellidos}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Consultando...</p>}
      {error && <div className="alert-error">{error}</div>}

      {estado && (
        <div className="card" style={{ maxWidth: 480, marginBottom: 24 }}>
          <h3>Estado académico</h3>
          <p><strong>{estado.estudiante.nombres} {estado.estudiante.apellidos}</strong> — DNI {estado.estudiante.dni}</p>
          <p>Promedio: {estado.promedio ?? '— sin notas registradas —'}</p>
          <p>Estado: {pillEstado(estado.estado)}</p>
          <button className="btn btn-primary" onClick={emitirCertificado} disabled={estado.estado !== 'APROBADO'}>
            <FiAward /> Emitir certificado digital
          </button>
          {estado.estado !== 'APROBADO' && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Solo se puede emitir certificado si el estudiante está APROBADO.
            </p>
          )}
        </div>
      )}

      {certificado && (
        <div className="card" style={{ maxWidth: 480, borderColor: 'var(--success)' }}>
          <h3 className="heading-with-icon"><FiCheckCircle color="var(--success)" /> Certificado emitido</h3>
          <p><strong>Código:</strong> {certificado.codigo}</p>
          <p><strong>Estudiante:</strong> {certificado.nombres} {certificado.apellidos}</p>
          <p><strong>Promedio:</strong> {certificado.promedio}</p>
          <p><strong>Fecha de emisión:</strong> {new Date(certificado.fechaEmision).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
