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
      <ToastContainer />
      {location.pathname !== '/' && <NavBar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pacientes" element={<PacientesTable />} />
          <Route path="/terapeutas" element={<TerapeutasTable />} />
          <Route path="/citas" element={<CitasTable />} />
          <Route path="/encargados" element={<EncargadosTable />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
