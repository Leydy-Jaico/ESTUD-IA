import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Cursos from './pages/Cursos';
import Grupos from './pages/Grupos';
import Sesiones from './pages/Sesiones';
import Matriculas from './pages/Matriculas';
import Tareas from './pages/Tareas';
import Pagos from './pages/Pagos';
import Certificados from './pages/Certificados';
import Proyectos from './pages/Proyectos';
import Clientes from './pages/Clientes';
import Propuestas from './pages/Propuestas';
import Servicios from './pages/Servicios';
import Contratos from './pages/Contratos';
import Comunicaciones from './pages/Comunicaciones';
import Notificaciones from './pages/Notificaciones';
import MensajesContacto from './pages/MensajesContacto';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Inicio />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="sesiones" element={<Sesiones />} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="tareas" element={<Tareas />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="certificados" element={<Certificados />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="propuestas" element={<Propuestas />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="comunicaciones" element={<Comunicaciones />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="mensajes-contacto" element={<MensajesContacto />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
