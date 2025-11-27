import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// --- IMPORTS DE CSS ---
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './toast-custom.css';

// --- IMPORTS DE COMPONENTES ---
import GlobalToast from './components/share/GlobalToast';
import NavBar from './components/share/NavBar';
import Home from './components/Home';
import PacientesTable from "./components/Pacientes";
import TerapeutasTable from './components/Terapeuta';
import CitasTable from "./components/Citas";
import Login from './components/Login';
import EncargadosTable from "./components/Encargados";
import ProductosTable from "./components/Productos";
import BodegaTable from "./components/Bodegas";
import UsuariosTable from "./components/Usuario";
import DiagnosticosTable from "./components/Diagnosticos";
import PrestamosTable from "./components/Prestamos";
import ComprasTable from "./components/Compras";
import ServiciosTable from "./components/Servicios";
import RecibosTable from "./components/Recibos";
import CierresTable from "./components/Cierres";
import RolesTable from "./components/Roles";
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <GlobalToast />
      
      {location.pathname !== '/' && <NavBar />}

      <main className="main-content" style={{ overflow: 'auto', height: '100%' }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          
          {/* Rutas protegidas por módulo - acceso según permisos del usuario */}
          <Route path="/pacientes" element={<ProtectedRoute module="pacientes"><PacientesTable /></ProtectedRoute>} />
          <Route path="/terapeutas" element={<ProtectedRoute module="terapeutas"><TerapeutasTable /></ProtectedRoute>} />
          <Route path="/citas" element={<ProtectedRoute module="citas"><CitasTable /></ProtectedRoute>} />
          <Route path="/encargados" element={<ProtectedRoute module="encargados"><EncargadosTable /></ProtectedRoute>} />
          <Route path="/diagnosticos" element={<ProtectedRoute module="diagnosticos"><DiagnosticosTable /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute module="productos"><ProductosTable /></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute module="compras"><ComprasTable /></ProtectedRoute>} />
          <Route path="/bodega" element={<ProtectedRoute module="bodega"><BodegaTable /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute module="usuarios"><UsuariosTable /></ProtectedRoute>} />
          <Route path="/prestamos" element={<ProtectedRoute module="prestamos"><PrestamosTable /></ProtectedRoute>} />
          <Route path="/servicios" element={<ProtectedRoute module="servicios"><ServiciosTable /></ProtectedRoute>} />
          <Route path="/recibos" element={<ProtectedRoute module="recibos"><RecibosTable /></ProtectedRoute>} />
          <Route path="/cierres" element={<ProtectedRoute module="cierres"><CierresTable /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute module="roles"><RolesTable /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
