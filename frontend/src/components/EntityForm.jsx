import { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

// Formulario genérico dirigido por configuración de campos.
// fields = [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea', options?, required? }]
export default function EntityForm({ fields, initialValues, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [values, setValues] = useState(() => initialValues || {});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && <div className="alert-error">{error}</div>}
      {fields.map((f) => (
        <div className="form-field" key={f.name}>
          <label>{f.label}{f.required && ' *'}</label>
          {f.type === 'select' ? (
            <select
              value={values[f.name] ?? ''}
              required={f.required}
              onChange={(e) => handleChange(f.name, e.target.value)}
            >
              <option value="">-- Seleccione --</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              value={values[f.name] ?? ''}
              required={f.required}
              onChange={(e) => handleChange(f.name, e.target.value)}
            />
          ) : (
            <input
              type={f.type || 'text'}
              value={values[f.name] ?? ''}
              required={f.required}
              step={f.type === 'number' ? 'any' : undefined}
              onChange={(e) => handleChange(f.name, f.type === 'number' ? e.target.valueAsNumber || e.target.value : e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}><FiX /> Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <FiSave /> {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
