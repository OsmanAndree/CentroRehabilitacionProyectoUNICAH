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
          {/* Todas tus rutas quedan igual */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
         <Route path="/pacientes" element={<PacientesTable />} />
          <Route path="/terapeutas"element={<TerapeutasTable />} />
          <Route path="/citas" element={<CitasTable />} />
          <Route path="/encargados" element={<EncargadosTable />} />
          <Route path="/diagnosticos" element={<DiagnosticosTable />} />
          <Route path="/productos" element={<ProtectedRoute allowedRoles={["1"]}><ProductosTable /></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute allowedRoles={["1"]}><ComprasTable /></ProtectedRoute>} />
          <Route path="/bodega" element={<ProtectedRoute allowedRoles={["1"]}><BodegaTable /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedRoles={["1"]}><UsuariosTable /></ProtectedRoute>} />
          <Route path="/prestamos" element={<ProtectedRoute allowedRoles={["1"]}><PrestamosTable /></ProtectedRoute>} />
          <Route path="/servicios" element={<ProtectedRoute allowedRoles={["1"]}><ServiciosTable /></ProtectedRoute>} />
          <Route path="/recibos" element={<ProtectedRoute allowedRoles={["1"]}><RecibosTable /></ProtectedRoute>} />
          <Route path="/cierres" element={<ProtectedRoute allowedRoles={["1"]}><CierresTable /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
