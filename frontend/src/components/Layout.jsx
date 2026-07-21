import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome, FiBarChart2, FiUsers, FiBookOpen, FiLayers, FiCalendar, FiClipboard,
  FiFileText, FiDollarSign, FiAward, FiCpu, FiBriefcase, FiFileMinus,
  FiPackage, FiFilePlus, FiMessageCircle, FiBell, FiMail, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Inicio', icon: FiHome, roles: ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE', 'DESARROLLADOR'] },
  { to: '/reportes', label: 'Reportes', icon: FiBarChart2, roles: ['ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'] },
  { to: '/usuarios', label: 'Usuarios', icon: FiUsers, roles: ['ADMINISTRADOR'] },
  { to: '/cursos', label: 'Cursos', icon: FiBookOpen, roles: ['ADMINISTRADOR'] },
  { to: '/grupos', label: 'Grupos', icon: FiLayers, roles: ['ADMINISTRADOR', 'DOCENTE'] },
  { to: '/sesiones', label: 'Sesiones y Asistencia', icon: FiCalendar, roles: ['ADMINISTRADOR', 'DOCENTE'] },
  { to: '/matriculas', label: 'Matrículas', icon: FiClipboard, roles: ['ADMINISTRADOR'] },
  { to: '/tareas', label: 'Tareas y Entregas', icon: FiFileText, roles: ['ADMINISTRADOR', 'DOCENTE'] },
  { to: '/pagos', label: 'Pagos', icon: FiDollarSign, roles: ['ADMINISTRADOR'] },
  { to: '/certificados', label: 'Estado académico y Certificados', icon: FiAward, roles: ['ADMINISTRADOR', 'DOCENTE'] },
  { to: '/proyectos', label: 'Proyectos Labs', icon: FiCpu, roles: ['ADMINISTRADOR', 'DESARROLLADOR'] },
  { to: '/clientes', label: 'Clientes', icon: FiBriefcase, roles: ['ADMINISTRADOR'] },
  { to: '/propuestas', label: 'Propuestas', icon: FiFileMinus, roles: ['ADMINISTRADOR'] },
  { to: '/servicios', label: 'Servicios', icon: FiPackage, roles: ['ADMINISTRADOR'] },
  { to: '/contratos', label: 'Contratos', icon: FiFilePlus, roles: ['ADMINISTRADOR'] },
  { to: '/comunicaciones', label: 'Comunicaciones y Soporte', icon: FiMessageCircle, roles: ['ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'] },
  { to: '/notificaciones', label: 'Notificaciones', icon: FiBell, roles: ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE', 'DESARROLLADOR'] },
  { to: '/mensajes-contacto', label: 'Mensajes de contacto', icon: FiMail, roles: ['ADMINISTRADOR'] }
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ESTUD-IA</div>
        <nav>
          {NAV.filter((item) => item.roles.includes(usuario?.rol)).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <item.icon className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div>
            <strong>{usuario?.nombres} {usuario?.apellidos}</strong>
            <span className="badge">{usuario?.rol}</span>
          </div>
          <button className="btn btn-secondary btn-icon-text" onClick={handleLogout}>
            <FiLogOut /> Cerrar sesión
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
