import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css';
import NavBar from './components/share/NavBar';
import Home from './components/Home';
import PacientesTable from "./components/Pacientes";
import TerapeutasTable from './components/Terapeuta';
import CitasTable from "./components/Citas";
import Login from './components/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EncargadosTable from "./components/Encargados";
import ProductosTable from "./components/Productos";
import BodegaTable from "./components/Bodegas";
import UsuariosTable from "./components/Usuario";
import DiagnosticosTable from "./components/Diagnosticos";
import PrestamosTable from "./components/Prestamos";
import ComprasTable from "./components/Compras";
import './toast-custom.css';
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="custom-toast"
      />
      {location.pathname !== '/' && <NavBar />}
      <main className="main-content" style={{ overflow: 'auto', height: '100%' }}>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pacientes" element={<PacientesTable />} />
          <Route path="/terapeutas" element={<TerapeutasTable />} />
          <Route path="/citas" element={<CitasTable />} />
          <Route path="/encargados" element={<EncargadosTable />} />

          {/* Rutas protegidas para roles diferentes a "1". En este caso solo se permite rol "1" */}
          <Route path="/productos" element={
            <ProtectedRoute allowedRoles={["1"]}>
              <ProductosTable />
            </ProtectedRoute>
          } />
          <Route path="/compras" element={
            <ProtectedRoute allowedRoles={["1"]}>
              <ComprasTable />
            </ProtectedRoute>
          } />
          <Route path="/bodega" element={
            <ProtectedRoute allowedRoles={["1"]}>
              <BodegaTable />
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute allowedRoles={["1"]}>
              <UsuariosTable />
            </ProtectedRoute>
          } />
          <Route path="/diagnosticos" element={<DiagnosticosTable />} />

          <Route path="/prestamos" element={
            <ProtectedRoute allowedRoles={["1"]}>
              <PrestamosTable />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}

export default App;
